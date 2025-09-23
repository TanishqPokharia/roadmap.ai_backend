"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
let V1PostRepository = class V1PostRepository {
    getUserPostStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = yield post_1.default.aggregate([
                    { $match: { authorId: userId } },
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
        });
    }
    getPostedRoadmap(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const post = yield post_1.default.findById(postId);
                if (!post) {
                    return {
                        data: null,
                        error: new errors_1.NotFoundError("Post not found")
                    };
                }
                const roadmap = post.roadmap;
                return { data: roadmap, error: null };
            }
            catch (error) {
                logger_1.logger.error(error, "Error getting roadmap from the post");
                return {
                    data: null,
                    error: new errors_1.DatabaseError("Failed to get roadmap from the post")
                };
            }
        });
    }
    getPopularPosts(limit, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const posts = yield post_1.default.find({
                    createdAt: {
                        $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
                    },
                })
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
        });
    }
    getPostsByTitle(topic, limit, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const posts = yield post_1.default.find({
                    "roadmap.title": { $regex: topic, $options: "i" },
                })
                    .sort({ likes: -1 })
                    .limit(limit)
                    .skip(skip)
                    .populate("author", "username email avatar id")
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
        });
    }
    uploadPost(userId, roadmap, bannerImageBuffer) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userInfo = yield user_1.default.findById(userId, "username email ", {
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
                const result = yield new Promise((resolve, reject) => {
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
                const savedPost = yield post.save();
                // mark the roadmap as posted
                yield roadmap_1.default.updateOne({ _id: roadmap.id }, { isPosted: true }).exec();
                return { data: savedPost._id.toString(), error: null };
            }
            catch (error) {
                logger_1.logger.error(error, "Error uploading post");
                return {
                    data: null,
                    error: new errors_1.DatabaseError(`Failed to upload post: ${error.message}`),
                };
            }
        });
    }
    getPostsByTime(time, limit, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const timeMap = {
                    day: 1,
                    week: 7,
                    month: 30,
                    year: 365,
                };
                const posts = yield post_1.default.find({
                    createdAt: {
                        $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * timeMap[time]),
                    },
                })
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
        });
    }
    togglePostLike(userId, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const likedEntry = yield likes_1.default.findOne({ userId, postId }).exec();
                const isAlreadyLiked = likedEntry !== null;
                if (isAlreadyLiked) {
                    yield likes_1.default.deleteOne({ userId, postId }).exec();
                }
                else {
                    const like = new likes_1.default({
                        userId,
                        postId,
                    });
                    yield like.save();
                }
                const post = yield post_1.default.findOneAndUpdate({ _id: postId }, {
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
        });
    }
    getUserPostsMetaData(userId, limit, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const posts = yield post_1.default.find({ authorId: userId })
                    .select("-roadmap.goals")
                    .limit(limit)
                    .skip(skip)
                    .sort({ createdAt: -1 })
                    .populate("author", "username email avatar")
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
        });
    }
    getUserPostRoadmap(userId, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const post = yield post_1.default.findOne({ _id: postId, authorId: userId })
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
        });
    }
    getPostsByAuthor(authorId, limit, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const posts = yield post_1.default.find()
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
        });
    }
    toggleView(userId, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // check if the post is viewd by the user
                const isViewed = yield views_1.default.findOne({ userId, postId });
                // do nothing if the post is already viewed
                if (isViewed)
                    return { data: null, error: null };
                // if it is not viewed, add the entry in the Views collection and increment the views count in the post
                yield views_1.default.create({ userId, postId });
                yield post_1.default.updateOne({ _id: postId }, { $inc: { views: 1 } });
                return { data: null, error: null };
            }
            catch (error) {
                logger_1.logger.error(error, "Error checking viewed or updating view count");
                return {
                    data: null,
                    error: new errors_1.DatabaseError(`Failed to check or increase views: ${error.message}`)
                };
            }
        });
    }
};
V1PostRepository = __decorate([
    (0, tsyringe_1.injectable)()
], V1PostRepository);
exports.default = V1PostRepository;
