var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { v2 as cloudinary, } from "cloudinary";
import { injectable } from "tsyringe";
import Post from "../../../schemas/post.js";
import { logger } from "../../../utils/logger.js";
import { DatabaseError, NotFoundError } from "../../../utils/errors.js";
import Roadmap from "../../../schemas/roadmap.js";
import Likes from "../../../schemas/likes.js";
import User from "../../../schemas/user.js";
import mongoose from "mongoose";
import Views from "../../../schemas/views.js";
let V1PostRepository = class V1PostRepository {
    async getUserPostStats(userId) {
        try {
            const stats = await Post.aggregate([
                { $match: { authorId: new mongoose.Types.ObjectId(userId) } },
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
            logger.error(error, "Error getting user post stats");
            return {
                data: null,
                error: new DatabaseError("Failed to get user post stats"),
            };
        }
    }
    async getPostDetails(userId, postId) {
        try {
            // find the post
            const post = await Post.findById(postId).populate("author");
            if (!post) {
                return {
                    data: null,
                    error: new NotFoundError("Post not found")
                };
            }
            // check if post has already been saved by the user
            const savedRoadmapId = await Roadmap.exists({
                userId,
                postId
            });
            const isSaved = savedRoadmapId !== null;
            // preserve the roadmap from being removed during toJson
            const fullPost = post.toObject();
            const data = {
                post: fullPost,
                isSaved
            };
            return { data, error: null };
        }
        catch (error) {
            logger.error(error, "Error getting roadmap from the post");
            return {
                data: null,
                error: new DatabaseError("Failed to get roadmap from the post")
            };
        }
    }
    async getPopularPosts(userId, limit, skip, genre) {
        try {
            const posts = await Post.find({
                createdAt: {
                    $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // uploaded within past two weeks
                },
                genre: {
                    $in: genre
                }
            })
                .populate("author")
                .populate("isLiked", null, Likes, {
                userId
            })
                .limit(limit)
                .skip(skip)
                .sort({ likes: -1, })
                .exec();
            console.log(posts);
            return { data: posts, error: null };
        }
        catch (error) {
            logger.error(error, "Error getting popular posts");
            return {
                data: null,
                error: new DatabaseError(`Failed to get popular posts: ${error.message}`),
            };
        }
    }
    async getPostsByTitle(userId, topic, limit, skip) {
        try {
            const posts = await Post.find({
                "roadmap.title": { $regex: topic, $options: "i" },
            })
                .populate("author")
                .populate("isLiked", null, Likes, {
                userId
            })
                .sort({ likes: -1 })
                .limit(limit)
                .skip(skip)
                .exec();
            return { data: posts, error: null };
        }
        catch (error) {
            logger.error(error, "Error getting posts by title");
            return {
                data: null,
                error: new DatabaseError(`Failed to get posts by title: ${error.message}`),
            };
        }
    }
    async uploadPost(userId, roadmap, bannerImageBuffer, genre) {
        try {
            const userInfo = await User.findById(userId, "username email ", {
                limit: 1,
            });
            if (!userInfo) {
                return {
                    data: null,
                    error: new NotFoundError("User not found"),
                };
            }
            // image upload configuration for post banners (kept separate from avatars)
            const bannerPublicId = `${userId}_banner_${new mongoose.Types.ObjectId().toString()}`;
            const options = {
                unique_filename: true,
                overwrite: false,
                public_id: bannerPublicId,
                folder: "roadmap_ai/post_banners",
                transformation: [
                    { width: 800, height: 400, crop: "fit" },
                    { quality: "auto", fetch_format: "auto" },
                ],
                resource_type: "image",
                use_filename: false,
            };
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream(options, (error, result) => {
                    if (error) {
                        logger.error(error, "Error uploading avatar");
                        return reject(error);
                    }
                    else {
                        if (!result) {
                            logger.error("No result returned from upload");
                            return reject(new Error("No result returned from upload"));
                        }
                        return resolve(result);
                    }
                })
                    .end(bannerImageBuffer);
            });
            const post = new Post({
                authorId: userId,
                roadmap,
                bannerImage: result.secure_url,
                genre
            });
            const savedPost = await post.save();
            // mark the roadmap as posted
            await Roadmap.updateOne({ _id: roadmap.id }, { postId: savedPost._id }).exec();
            return { data: savedPost._id.toString(), error: null };
        }
        catch (error) {
            logger.error(error, "Error uploading post");
            return {
                data: null,
                error: new DatabaseError(`Failed to upload post: ${error.message}`),
            };
        }
    }
    async getPostsByTime(userId, time, limit, skip, genre) {
        try {
            const timeMap = {
                day: 1,
                week: 7,
                month: 30,
                year: 365,
            };
            const posts = await Post.find({
                createdAt: {
                    $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * timeMap[time]),
                },
                genre: {
                    $in: genre
                }
            })
                .populate("author")
                .populate("isLiked", null, Likes, {
                userId
            })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip)
                .exec();
            return { data: posts, error: null };
        }
        catch (error) {
            logger.error(error, "Error getting posts by time");
            return {
                data: null,
                error: new DatabaseError(`Failed to get posts by time: ${error.message}`),
            };
        }
    }
    async togglePostLike(userId, postId) {
        try {
            const likedEntry = await Likes.findOne({ userId, postId }).exec();
            const isAlreadyLiked = likedEntry !== null;
            if (isAlreadyLiked) {
                await Likes.deleteOne({ userId, postId }).exec();
            }
            else {
                const like = new Likes({
                    userId,
                    postId,
                });
                await like.save();
            }
            const post = await Post.findOneAndUpdate({ _id: postId }, {
                $inc: { likes: isAlreadyLiked ? -1 : 1 },
            }).exec();
            if (!post) {
                return {
                    data: null,
                    error: new NotFoundError("Post not found"),
                };
            }
            return {
                data: isAlreadyLiked ? "Post unliked" : "Post liked",
                error: null,
            };
        }
        catch (error) {
            logger.error(error, "Error toggling post like");
            return {
                data: null,
                error: new DatabaseError(`Failed to toggle post like: ${error.message}`),
            };
        }
    }
    async getUserPostsMetaData(userId, limit, skip) {
        try {
            const posts = await Post.find({ authorId: userId })
                .limit(limit)
                .skip(skip)
                .sort({ createdAt: -1 })
                .populate("author")
                .exec();
            return { data: posts, error: null };
        }
        catch (error) {
            logger.error(error, "Error getting user posted roadmaps");
            return {
                data: null,
                error: new DatabaseError(`Failed to get user posted roadmaps: ${error.message}`),
            };
        }
    }
    async getUserPostRoadmap(userId, postId) {
        try {
            const post = await Post.findOne({ _id: postId, authorId: userId })
                .populate("roadmap")
                .exec();
            if (!post) {
                return {
                    data: null,
                    error: new NotFoundError("Post not found or does not belong to user"),
                };
            }
            return { data: post.roadmap, error: null };
        }
        catch (error) {
            logger.error(error, "Error getting user posted roadmap");
            return {
                data: null,
                error: new DatabaseError(`Failed to get user posted roadmap: ${error.message}`),
            };
        }
    }
    async getPostsByAuthor(userId, authorId, limit, skip) {
        try {
            const posts = await Post.find()
                .where({
                authorId,
            })
                .populate("author")
                .populate("isLiked", null, Likes, {
                userId
            })
                .limit(limit)
                .skip(skip)
                .sort({ createdAt: -1 })
                .populate("author", "username email avatar")
                .exec();
            return { data: posts, error: null };
        }
        catch (error) {
            logger.error(error, "Error getting posts by author");
            return {
                data: null,
                error: new DatabaseError(`Failed to get posts by author: ${error.message}`),
            };
        }
    }
    async toggleView(userId, postId) {
        try {
            // check if the post is viewd by the user
            const isViewed = await Views.findOne({ userId, postId });
            // do nothing if the post is already viewed
            if (isViewed)
                return { data: null, error: null };
            // if it is not viewed, add the entry in the Views collection and increment the views count in the post
            await Views.create({ userId, postId });
            await Post.updateOne({ _id: postId }, { $inc: { views: 1 } });
            return { data: null, error: null };
        }
        catch (error) {
            logger.error(error, "Error checking viewed or updating view count");
            return {
                data: null,
                error: new DatabaseError(`Failed to check or increase views: ${error.message}`)
            };
        }
    }
};
V1PostRepository = __decorate([
    injectable()
], V1PostRepository);
export default V1PostRepository;
