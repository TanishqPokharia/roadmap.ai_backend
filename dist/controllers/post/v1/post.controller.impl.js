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
import { inject, injectable } from "tsyringe";
import { z } from "zod/v4";
import { ValidationError } from "../../../utils/errors.js";
import PostGenre from "../../../enums/post.genre.js";
const allowedGenres = new Set(Object.values(PostGenre).map((e) => e.toString()));
let V1PostController = class V1PostController {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    getUserPostStats = async (req, res, next) => {
        const userId = req.token;
        const { data, error } = await this.repo.getUserPostStats(userId.toString());
        if (error) {
            next(error);
            return;
        }
        console.log(data);
        res.status(200).json(data);
    };
    getPopularPosts = async (req, res, next) => {
        const { limit, skip, genre } = req.query;
        const userId = req.token;
        const popularPostsSchema = z.object({
            userId: z.string().min(1, "User ID is required"),
            limit: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
            skip: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
            genre: z.preprocess((val) => {
                if (!val)
                    return [];
                if (Array.isArray(val))
                    return val;
                return [val];
            }, z.array(z.string())
                .refine(arr => arr.every(v => allowedGenres.has(v)))
                .optional()),
        });
        const validation = popularPostsSchema.safeParse({
            userId,
            limit,
            skip,
            genre
        });
        if (!validation.success) {
            next(new ValidationError(z.prettifyError(validation.error)));
            return;
        }
        const validated = validation.data;
        const { data: posts, error } = await this.repo.getPopularPosts(validated.userId, validated.limit, validated.skip, validated.genre);
        if (error) {
            next(error);
            return;
        }
        res.status(200).json({ posts });
    };
    getPostsByTitle = async (req, res, next) => {
        const { q, limit, skip } = req.query;
        const userId = req.token;
        // validate params
        const postTitleSchema = z.object({
            userId: z.string().min(1, "User ID is required"),
            q: z.string().min(1, "Proper title is required").max(100),
            limit: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
            skip: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
        });
        const validation = postTitleSchema.safeParse({
            userId,
            q,
            limit,
            skip,
        });
        if (!validation.success) {
            next(new ValidationError(z.prettifyError(validation.error)));
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
    uploadPost = async (req, res, next) => {
        const userId = req.token;
        if (!req.file) {
            next(new ValidationError("Banner Image is required"));
            return;
        }
        const roadmap = JSON.parse(req.body.roadmap); // multipart form data is not parsed automatically by express
        const bannerImageBuffer = req.file.buffer;
        const genre = JSON.parse(req.body.genre);
        if (!bannerImageBuffer) {
            next(new ValidationError("Could not process banner image"));
            return;
        }
        // validate params
        const postSchema = z.object({
            userId: z.string().min(1, "User ID is required"),
            roadmap: z.object({
                id: z.string().min(1, "Roadmap ID is required"),
                title: z.string().min(1, "Roadmap title is required").max(100),
                goals: z.array(z.any()).min(1, "Roadmap must have at least one goal"),
            }),
            genre: z.preprocess((val) => {
                if (!val)
                    return [];
                if (Array.isArray(val))
                    return val;
                return [val];
            }, z.array(z.string())
                .refine(arr => arr.every(v => allowedGenres.has(v)))
                .optional()),
            bannerImage: z.instanceof(Buffer, { error: "Banner image is required" }),
        });
        const validation = postSchema.safeParse({
            userId,
            roadmap,
            genre,
            bannerImageBuffer,
        });
        if (!validation.success) {
            next(new ValidationError(z.prettifyError(validation.error)));
            return;
        }
        const validated = validation.data;
        const { data, error } = await this.repo.uploadPost(validated.userId, roadmap, bannerImageBuffer, validated.genre);
        if (error) {
            next(error);
            return;
        }
        res.status(201).json({ post: data });
    };
    getPostsByTime = async (req, res, next) => {
        const { time, limit, skip, genre } = req.query;
        const userId = req.token;
        // validate params
        const postTimeSchema = z.object({
            userId: z.string().min(1, "User ID is required"),
            time: z.enum(["day", "week", "month", "year"]),
            limit: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
            skip: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
            genre: z.preprocess((val) => {
                if (!val)
                    return [];
                if (Array.isArray(val))
                    return val;
                return [val];
            }, z.array(z.string())
                .refine(arr => arr.every(v => allowedGenres.has(v)))
                .optional()),
        });
        const validation = postTimeSchema.safeParse({
            userId,
            time,
            limit,
            skip,
            genre
        });
        if (!validation.success) {
            next(new ValidationError(z.prettifyError(validation.error)));
            return;
        }
        const validated = validation.data;
        const { data: posts, error } = await this.repo.getPostsByTime(validated.userId, validated.time, validated.limit, validated.skip, validated.genre);
        if (error) {
            next(error);
            return;
        }
        res.status(200).json({ posts });
    };
    togglePostLike = async (req, res, next) => {
        const userId = req.token;
        const postId = req.params.postId;
        // validate params
        const toggleLikeSchema = z.object({
            userId: z.string().min(1, "User ID is required"),
            postId: z.string().min(1, "Post ID is required"),
        });
        const validation = toggleLikeSchema.safeParse({ userId, postId });
        if (!validation.success) {
            next(new ValidationError(z.prettifyError(validation.error)));
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
    getPostsByAuthor = async (req, res, next) => {
        const authorId = req.params.authorId;
        const { limit, skip } = req.query;
        const userId = req.token;
        // validate params
        const authorPostsSchema = z.object({
            userId: z.string().min(1, "User ID is required"),
            authorId: z.string().min(1, "Author ID is required"),
            limit: z.preprocess((val) => Number(val), z.int().nonnegative()),
            skip: z.preprocess((val) => Number(val), z.int().nonnegative()),
        });
        const validation = authorPostsSchema.safeParse({
            userId,
            authorId,
            limit,
            skip,
        });
        if (!validation.success) {
            next(new ValidationError(z.prettifyError(validation.error)));
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
    getPostDetails = async (req, res, next) => {
        const postId = req.params.postId;
        const userId = req.token;
        if (!postId) {
            next(new ValidationError("post id is required"));
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
    getUserPostsMetaData = async (req, res, next) => {
        const userId = req.token;
        const { limit, skip } = req.query;
        const getUserPostedRoadmapsMetaDataSchema = z.object({
            userId: z.string().nonempty("User ID is required."),
            limit: z.preprocess((val) => val ? 10 : Number(val), z.int().nonnegative()),
            skip: z.preprocess((val) => val ? 0 : Number(val), z.int().nonnegative()),
        });
        const validateInputs = getUserPostedRoadmapsMetaDataSchema.safeParse({
            userId,
            limit,
            skip,
        });
        if (!validateInputs.success) {
            next(new ValidationError(z.prettifyError(validateInputs.error)));
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
    getUserPostRoadmap = async (req, res, next) => {
        const userId = req.token;
        const postId = req.params.postId;
        if (!postId) {
            next(new ValidationError("post id is required"));
            return;
        }
        const { data: roadmap, error } = await this.repo.getUserPostRoadmap(userId, postId);
        if (error) {
            next(error);
            return;
        }
        res.status(200).json({ roadmap });
    };
};
V1PostController = __decorate([
    injectable(),
    __param(0, inject("PostRepository")),
    __metadata("design:paramtypes", [Object])
], V1PostController);
export default V1PostController;
