"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsyringe_1 = require("tsyringe");
const v4_1 = require("zod/v4");
const errors_1 = require("../../../utils/errors");
let V1PostController = class V1PostController {
    constructor(repo) {
        this.repo = repo;
        this.getUserPostStats = async (req, res, next) => {
            const userId = req.token;
            const { data, error } = await this.repo.getUserPostStats(userId.toString());
            if (error) {
                next(error);
                return;
            }
            console.log(data);
            res.status(200).json(data);
        };
        this.getPopularPosts = async (req, res, next) => {
            const { limit, skip } = req.query;
            const userId = req.token;
            const popularPostsSchema = v4_1.z.object({
                userId: v4_1.z.string().min(1, "User ID is required"),
                limit: v4_1.z.preprocess((val) => Number(val), v4_1.z.number().int().nonnegative()),
                skip: v4_1.z.preprocess((val) => Number(val), v4_1.z.number().int().nonnegative()),
            });
            const validation = popularPostsSchema.safeParse({
                userId,
                limit,
                skip,
            });
            if (!validation.success) {
                next(new errors_1.ValidationError(v4_1.z.prettifyError(validation.error)));
                return;
            }
            const validated = validation.data;
            const { data: posts, error } = await this.repo.getPopularPosts(validated.userId, validated.limit, validated.skip);
            if (error) {
                next(error);
                return;
            }
            res.status(200).json({ posts });
        };
        this.getPostsByTitle = async (req, res, next) => {
            const { q, limit, skip } = req.query;
            const userId = req.token;
            // validate params
            const postTitleSchema = v4_1.z.object({
                userId: v4_1.z.string().min(1, "User ID is required"),
                q: v4_1.z.string().min(1, "Proper title is required").max(100),
                limit: v4_1.z.preprocess((val) => Number(val), v4_1.z.number().int().nonnegative()),
                skip: v4_1.z.preprocess((val) => Number(val), v4_1.z.number().int().nonnegative()),
            });
            const validation = postTitleSchema.safeParse({
                userId,
                q,
                limit,
                skip,
            });
            if (!validation.success) {
                next(new errors_1.ValidationError(v4_1.z.prettifyError(validation.error)));
                return;
            }
            const validated = validation.data;
            const { data: posts, error } = await this.repo.getPostsByTitle(validated.userId, validated.q, validated.limit, validated.skip);
            if (error) {
                next(error);
                return;
            }
            res.status(200).json({ posts });
        };
        this.uploadPost = async (req, res, next) => {
            const userId = req.token;
            if (!req.file) {
                next(new errors_1.ValidationError("Banner Image is required"));
                return;
            }
            const roadmap = JSON.parse(req.body.roadmap); // multipart form data is not parsed automatically by express
            const bannerImageBuffer = req.file.buffer;
            if (!bannerImageBuffer) {
                next(new errors_1.ValidationError("Could not process banner image"));
                return;
            }
            // validate params
            const post = v4_1.z.object({
                userId: v4_1.z.string().min(1, "User ID is required"),
                roadmap: v4_1.z.object({
                    id: v4_1.z.string().min(1, "Roadmap ID is required"),
                    title: v4_1.z.string().min(1, "Roadmap title is required").max(100),
                    goals: v4_1.z.array(v4_1.z.any()).min(1, "Roadmap must have at least one goal"),
                }),
                bannerImage: v4_1.z.instanceof(Buffer, { error: "Banner image is required" }),
            });
            const validation = post.safeParse({
                userId,
                roadmap,
                bannerImage: bannerImageBuffer
            });
            if (!validation.success) {
                next(new errors_1.ValidationError(v4_1.z.prettifyError(validation.error)));
                return;
            }
            const validated = validation.data;
            const { data, error } = await this.repo.uploadPost(validated.userId, roadmap, bannerImageBuffer);
            if (error) {
                next(error);
                return;
            }
            res.status(201).json({ post: data });
        };
        this.getPostsByTime = async (req, res, next) => {
            const { time, limit, skip } = req.query;
            const userId = req.token;
            // validate params
            const postTimeSchema = v4_1.z.object({
                userId: v4_1.z.string().min(1, "User ID is required"),
                time: v4_1.z.enum(["day", "week", "month", "year"]),
                limit: v4_1.z.preprocess((val) => Number(val), v4_1.z.number().int().nonnegative()),
                skip: v4_1.z.preprocess((val) => Number(val), v4_1.z.number().int().nonnegative()),
            });
            const validation = postTimeSchema.safeParse({
                userId,
                time,
                limit,
                skip,
            });
            if (!validation.success) {
                next(new errors_1.ValidationError(v4_1.z.prettifyError(validation.error)));
                return;
            }
            const validated = validation.data;
            const { data: posts, error } = await this.repo.getPostsByTime(validated.userId, validated.time, validated.limit, validated.skip);
            if (error) {
                next(error);
                return;
            }
            res.status(200).json({ posts });
        };
        this.togglePostLike = async (req, res, next) => {
            const userId = req.token;
            const postId = req.params.postId;
            // validate params
            const toggleLikeSchema = v4_1.z.object({
                userId: v4_1.z.string().min(1, "User ID is required"),
                postId: v4_1.z.string().min(1, "Post ID is required"),
            });
            const validation = toggleLikeSchema.safeParse({ userId, postId });
            if (!validation.success) {
                next(new errors_1.ValidationError(v4_1.z.prettifyError(validation.error)));
                return;
            }
            const validated = validation.data;
            const { data, error } = await this.repo.togglePostLike(validated.userId, validated.postId);
            if (error) {
                next(error);
                return;
            }
            res.status(200).json({ message: data });
        };
        this.getPostsByAuthor = async (req, res, next) => {
            const authorId = req.params.authorId;
            const { limit, skip } = req.query;
            const userId = req.token;
            // validate params
            const authorPostsSchema = v4_1.z.object({
                userId: v4_1.z.string().min(1, "User ID is required"),
                authorId: v4_1.z.string().min(1, "Author ID is required"),
                limit: v4_1.z.preprocess((val) => Number(val), v4_1.z.int().nonnegative()),
                skip: v4_1.z.preprocess((val) => Number(val), v4_1.z.int().nonnegative()),
            });
            const validation = authorPostsSchema.safeParse({
                authorId,
                limit,
                skip,
            });
            if (!validation.success) {
                next(new errors_1.ValidationError(v4_1.z.prettifyError(validation.error)));
                return;
            }
            const validated = validation.data;
            const { data: posts, error } = await this.repo.getPostsByAuthor(validated.userId, validated.authorId, validated.limit, validated.skip);
            if (error) {
                next(error);
                return;
            }
            res.status(200).json({ posts });
        };
        this.getPostDetails = async (req, res, next) => {
            const postId = req.params.postId;
            const userId = req.token;
            if (!postId) {
                next(new errors_1.ValidationError("post id is required"));
                return;
            }
            const { data, error } = await this.repo.getPostDetails(userId, postId);
            if (error) {
                next(error);
                return;
            }
            // if getting roadmap is successfull, set a job to toggle view status
            setImmediate(() => {
                this.repo.toggleView(userId, postId);
            });
            res.status(200).json(data);
        };
        this.getUserPostsMetaData = async (req, res, next) => {
            const userId = req.token;
            const { limit, skip } = req.query;
            const getUserPostedRoadmapsMetaDataSchema = v4_1.z.object({
                userId: v4_1.z.string().nonempty("User ID is required."),
                limit: v4_1.z.preprocess((val) => val ? 10 : Number(val), v4_1.z.int().nonnegative()),
                skip: v4_1.z.preprocess((val) => val ? 0 : Number(val), v4_1.z.int().nonnegative()),
            });
            const validateInputs = getUserPostedRoadmapsMetaDataSchema.safeParse({
                userId,
                limit,
                skip,
            });
            if (!validateInputs.success) {
                next(new errors_1.ValidationError(v4_1.z.prettifyError(validateInputs.error)));
                return;
            }
            const validated = validateInputs.data;
            const { data: posts, error } = await this.repo.getUserPostsMetaData(validated.userId, validated.limit, validated.skip);
            if (error) {
                next(error);
                return;
            }
            res.status(200).json({ posts });
        };
        this.getUserPostRoadmap = async (req, res, next) => {
            const userId = req.token;
            const postId = req.params.postId;
            if (!postId) {
                next(new errors_1.ValidationError("post id is required"));
                return;
            }
            const { data: roadmap, error } = await this.repo.getUserPostRoadmap(userId, postId);
            if (error) {
                next(error);
                return;
            }
            res.status(200).json({ roadmap });
        };
    }
};
V1PostController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("PostRepository")),
    __metadata("design:paramtypes", [Object])
], V1PostController);
exports.default = V1PostController;
