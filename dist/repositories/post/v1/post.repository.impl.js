"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsyringe_1 = require("tsyringe");
const likes_1 = __importDefault(require("../../../schemas/likes"));
const post_1 = __importDefault(require("../../../schemas/post"));
const logger_1 = require("../../../utils/logger");
const user_1 = __importDefault(require("../../../schemas/user"));
const views_1 = __importDefault(require("../../../schemas/views"));
const errors_1 = require("../../../utils/errors");
const cloudinary_1 = require("cloudinary");
const roadmap_1 = __importDefault(require("../../../schemas/roadmap"));
const mongoose_1 = __importDefault(require("mongoose"));
let V1PostRepository = class V1PostRepository {
    async getUserPostStats(userId) {
        try {
            // Convert string userId to ObjectId for proper matching
            const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
            const stats = await post_1.default.aggregate([
                { $match: { authorId: userObjectId } },
                {
                    $group: {
                        _id: null,
                        totalPosts: { $sum: 1 },
                        totalLikes: { $sum: "$likes" },
                        totalViews: { $sum: "$views" },
                    },
                },
            ]);
            if (!stats || stats.length === 0) {
                return {
                    data: {
                        totalPosts: 0,
                        totalLikes: 0,
                        totalViews: 0,
                    },
                    error: null,
                };
            }
            return { data: stats[0], error: null };
        }
        catch (error) {
            logger_1.logger.error(error, "Error getting user post stats");
            return {
                data: null,
                error: new errors_1.DatabaseError("Failed to get user post stats"),
            };
        }
    }
    async getPostDetails(userId, postId) {
        try {
            // find the post
            const post = await post_1.default.findById(postId).populate("author");
            if (!post) {
                return {
                    data: null,
                    error: new errors_1.NotFoundError("Post not found")
                };
            }
            // check if post has already been saved by the user
            const savedRoadmapId = await roadmap_1.default.exists({
                userId,
                postId
            });
            const isSaved = savedRoadmapId !== null;
            // preserve the roadmap from being removed during toJson
            const fullPost = post.toObject();
            delete fullPost._id;
            const data = {
                post: fullPost,
                isSaved
            };
            return { data, error: null };
        }
        catch (error) {
            logger_1.logger.error(error, "Error getting roadmap from the post");
            return {
                data: null,
                error: new errors_1.DatabaseError("Failed to get roadmap from the post")
            };
        }
    }
    async getPopularPosts(limit, skip) {
        try {
            const posts = await post_1.default.find({
                createdAt: {
                    $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
                },
            })
                .populate("author")
                .limit(limit)
                .skip(skip)
                .sort({ likes: -1 })
                .exec();
            console.log(posts);
            return { data: posts, error: null };
        }
        catch (error) {
            logger_1.logger.error(error, "Error getting popular posts");
            return {
                data: null,
                error: new errors_1.DatabaseError(`Failed to get popular posts: ${error.message}`),
            };
        }
    }
    async getPostsByTitle(topic, limit, skip) {
        try {
            const posts = await post_1.default.find({
                "roadmap.title": { $regex: topic, $options: "i" },
            })
                .populate("author")
                .sort({ likes: -1 })
                .limit(limit)
                .skip(skip)
                .exec();
            return { data: posts, error: null };
        }
        catch (error) {
            logger_1.logger.error(error, "Error getting posts by title");
            return {
                data: null,
                error: new errors_1.DatabaseError(`Failed to get posts by title: ${error.message}`),
            };
        }
    }
    async uploadPost(userId, roadmap, bannerImageBuffer) {
        try {
            const userInfo = await user_1.default.findById(userId, "username email ", {
                limit: 1,
            });
            if (!userInfo) {
                return {
                    data: null,
                    error: new errors_1.NotFoundError("User not found"),
                };
            }
            const options = {
                unique_filename: false,
                overwrite: true,
                public_id: userId,
                folder: "roadmap_ai/avatars",
                transformation: [
                    { width: 200, height: 200, crop: "fill" },
                    { quality: "auto", fetch_format: "auto" },
                ],
                resource_type: "image",
                use_filename: false,
            };
            const result = await new Promise((resolve, reject) => {
                cloudinary_1.v2.uploader
                    .upload_stream(options, (error, result) => {
                    if (error) {
                        logger_1.logger.error(error, "Error uploading avatar");
                        return reject(error);
                    }
                    else {
                        if (!result) {
                            logger_1.logger.error("No result returned from upload");
                            return reject(new Error("No result returned from upload"));
                        }
                        return resolve(result);
                    }
                })
                    .end(bannerImageBuffer);
            });
            const post = new post_1.default({
                authorId: userId,
                roadmap,
                bannerImage: result.secure_url
            });
            const savedPost = await post.save();
            // mark the roadmap as posted
            await roadmap_1.default.updateOne({ _id: roadmap.id }, { postId: savedPost._id }).exec();
            return { data: savedPost._id.toString(), error: null };
        }
        catch (error) {
            logger_1.logger.error(error, "Error uploading post");
            return {
                data: null,
                error: new errors_1.DatabaseError(`Failed to upload post: ${error.message}`),
            };
        }
    }
    async getPostsByTime(time, limit, skip) {
        try {
            const timeMap = {
                day: 1,
                week: 7,
                month: 30,
                year: 365,
            };
            const posts = await post_1.default.find({
                createdAt: {
                    $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * timeMap[time]),
                },
            })
                .populate("author", "username email avatar")
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip)
                .exec();
            return { data: posts, error: null };
        }
        catch (error) {
            logger_1.logger.error(error, "Error getting posts by time");
            return {
                data: null,
                error: new errors_1.DatabaseError(`Failed to get posts by time: ${error.message}`),
            };
        }
    }
    async togglePostLike(userId, postId) {
        try {
            const likedEntry = await likes_1.default.findOne({ userId, postId }).exec();
            const isAlreadyLiked = likedEntry !== null;
            if (isAlreadyLiked) {
                await likes_1.default.deleteOne({ userId, postId }).exec();
            }
            else {
                const like = new likes_1.default({
                    userId,
                    postId,
                });
                await like.save();
            }
            const post = await post_1.default.findOneAndUpdate({ _id: postId }, {
                $inc: { likes: isAlreadyLiked ? -1 : 1 },
            }).exec();
            if (!post) {
                return {
                    data: null,
                    error: new errors_1.NotFoundError("Post not found"),
                };
            }
            return {
                data: isAlreadyLiked ? "Post unliked" : "Post liked",
                error: null,
            };
        }
        catch (error) {
            logger_1.logger.error(error, "Error toggling post like");
            return {
                data: null,
                error: new errors_1.DatabaseError(`Failed to toggle post like: ${error.message}`),
            };
        }
    }
    async getUserPostsMetaData(userId, limit, skip) {
        try {
            const posts = await post_1.default.find({ authorId: userId })
                .limit(limit)
                .skip(skip)
                .sort({ createdAt: -1 })
                .populate("author")
                .exec();
            return { data: posts, error: null };
        }
        catch (error) {
            logger_1.logger.error(error, "Error getting user posted roadmaps");
            return {
                data: null,
                error: new errors_1.DatabaseError(`Failed to get user posted roadmaps: ${error.message}`),
            };
        }
    }
    async getUserPostRoadmap(userId, postId) {
        try {
            const post = await post_1.default.findOne({ _id: postId, authorId: userId })
                .populate("roadmap")
                .exec();
            if (!post) {
                return {
                    data: null,
                    error: new errors_1.NotFoundError("Post not found or does not belong to user"),
                };
            }
            return { data: post.roadmap, error: null };
        }
        catch (error) {
            logger_1.logger.error(error, "Error getting user posted roadmap");
            return {
                data: null,
                error: new errors_1.DatabaseError(`Failed to get user posted roadmap: ${error.message}`),
            };
        }
    }
    async getPostsByAuthor(authorId, limit, skip) {
        try {
            const posts = await post_1.default.find()
                .where({
                authorId,
            })
                .limit(limit)
                .skip(skip)
                .sort({ createdAt: -1 })
                .populate("author", "username email avatar")
                .exec();
            return { data: posts, error: null };
        }
        catch (error) {
            logger_1.logger.error(error, "Error getting posts by author");
            return {
                data: null,
                error: new errors_1.DatabaseError(`Failed to get posts by author: ${error.message}`),
            };
        }
    }
    async toggleView(userId, postId) {
        try {
            // check if the post is viewd by the user
            const isViewed = await views_1.default.findOne({ userId, postId });
            // do nothing if the post is already viewed
            if (isViewed)
                return { data: null, error: null };
            // if it is not viewed, add the entry in the Views collection and increment the views count in the post
            await views_1.default.create({ userId, postId });
            await post_1.default.updateOne({ _id: postId }, { $inc: { views: 1 } });
            return { data: null, error: null };
        }
        catch (error) {
            logger_1.logger.error(error, "Error checking viewed or updating view count");
            return {
                data: null,
                error: new errors_1.DatabaseError(`Failed to check or increase views: ${error.message}`)
            };
        }
    }
};
V1PostRepository = __decorate([
    (0, tsyringe_1.injectable)()
], V1PostRepository);
exports.default = V1PostRepository;
