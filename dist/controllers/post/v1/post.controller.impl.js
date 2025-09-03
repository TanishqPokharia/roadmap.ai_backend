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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsyringe_1 = require("tsyringe");
const v4_1 = require("zod/v4");
const errors_1 = require("../../../utils/errors");
let V1PostController = class V1PostController {
    constructor(repo) {
        this.repo = repo;
        this.getPopularPosts = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { limit, skip } = req.query;
            const popularPostsSchema = v4_1.z.object({
                limit: v4_1.z.preprocess((val) => Number(val), v4_1.z.number().int().nonnegative()),
                skip: v4_1.z.preprocess((val) => Number(val), v4_1.z.number().int().nonnegative()),
            });
            const validation = popularPostsSchema.safeParse({
                limit,
                skip,
            });
            if (!validation.success) {
                next(new errors_1.ValidationError(v4_1.z.prettifyError(validation.error)));
                return;
            }
            const validated = validation.data;
            const { data: posts, error } = yield this.repo.getPopularPosts(validated.limit, validated.skip);
            if (error) {
                next(error);
                return;
            }
            res.status(200).json({ posts });
        });
        this.getPostsByTitle = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { title, limit, skip } = req.query;
            // validate params
            const postTitleSchema = v4_1.z.object({
                title: v4_1.z.string().min(1, "Proper title is required").max(100),
                limit: v4_1.z.preprocess((val) => Number(val), v4_1.z.number().int().nonnegative()),
                skip: v4_1.z.preprocess((val) => Number(val), v4_1.z.number().int().nonnegative()),
            });
            const validation = postTitleSchema.safeParse({
                title,
                limit,
                skip,
            });
            if (!validation.success) {
                next(new errors_1.ValidationError(v4_1.z.prettifyError(validation.error)));
                return;
            }
            const validated = validation.data;
            const { data: posts, error } = yield this.repo.getPostsByTitle(validated.title, validated.limit, validated.skip);
            if (error) {
                next(error);
                return;
            }
            res.status(200).json({ posts });
        });
        this.uploadPost = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.token;
            if (!req.body) {
                next(new errors_1.ValidationError("Request body is required"));
                return;
            }
            const { roadmap } = req.body;
            // validate params
            const post = v4_1.z.object({
                userId: v4_1.z.string().min(1, "User ID is required"),
                roadmap: v4_1.z.object({
                    id: v4_1.z.string().min(1, "Roadmap ID is required"),
                    title: v4_1.z.string().min(1, "Roadmap title is required").max(100),
                    goals: v4_1.z.array(v4_1.z.any()).min(1, "Roadmap must have at least one goal"),
                }),
            });
            const validation = post.safeParse({
                userId,
                roadmap,
            });
            if (!validation.success) {
                next(new errors_1.ValidationError(v4_1.z.prettifyError(validation.error)));
                return;
            }
            const validated = validation.data;
            const { data, error } = yield this.repo.uploadPost(validated.userId, roadmap);
            if (error) {
                next(error);
                return;
            }
            res.status(201).json({ post: data });
        });
        this.getPostsByTime = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { time, limit, skip } = req.query;
            // validate params
            const postTimeSchema = v4_1.z.object({
                time: v4_1.z.enum(["day", "week", "month", "year"]),
                limit: v4_1.z.preprocess((val) => Number(val), v4_1.z.number().int().nonnegative()),
                skip: v4_1.z.preprocess((val) => Number(val), v4_1.z.number().int().nonnegative()),
            });
            const validation = postTimeSchema.safeParse({
                time,
                limit,
                skip,
            });
            if (!validation.success) {
                next(new errors_1.ValidationError(v4_1.z.prettifyError(validation.error)));
                return;
            }
            const validated = validation.data;
            const { data: posts, error } = yield this.repo.getPostsByTime(validated.time, validated.limit, validated.skip);
            if (error) {
                next(error);
                return;
            }
            res.status(200).json({ posts });
        });
        this.togglePostLike = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
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
            const { data, error } = yield this.repo.togglePostLike(validated.userId, validated.postId);
            if (error) {
                next(error);
                return;
            }
            res.status(200).json({ message: data });
        });
        this.getPostsByAuthor = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const authorId = req.params.authorId;
            const { limit, skip } = req.query;
            // validate params
            const authorPostsSchema = v4_1.z.object({
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
            const { data: posts, error } = yield this.repo.getPostsByAuthor(validated.authorId, validated.limit, validated.skip);
            if (error) {
                next(error);
                return;
            }
            res.status(200).json({ posts });
        });
        this.getPostedRoadmap = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const postId = req.params.postId;
            const userId = req.token;
            if (!postId) {
                next(new errors_1.ValidationError("post id is required"));
                return;
            }
            const { data: roadmap, error } = yield this.repo.getPostedRoadmap(postId);
            if (error) {
                next(error);
                return;
            }
            // if getting roadmap is successfull, set a job to toggle view status
            setImmediate(() => {
                this.repo.toggleView(userId, postId);
            });
            res.status(200).json({ roadmap });
        });
        this.getUserPostsMetaData = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const userId = req.token;
            const { limit, skip } = req.query;
            const getUserPostedRoadmapsMetaDataSchema = v4_1.z.object({
                userId: v4_1.z.string().nonempty("User ID is required."),
                limit: v4_1.z.preprocess((val) => Number(val), v4_1.z.int().nonnegative().optional()),
                skip: v4_1.z.preprocess((val) => Number(val), v4_1.z.int().nonnegative().optional()),
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
            const { data: posts, error } = yield this.repo.getUserPostsMetaData(validated.userId, (_a = validated.limit) !== null && _a !== void 0 ? _a : 10, (_b = validated.skip) !== null && _b !== void 0 ? _b : 0);
            if (error) {
                next(error);
                return;
            }
            res.status(200).json({ posts });
        });
        this.getUserPostRoadmap = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.token;
            const postId = req.params.postId;
            if (!postId) {
                next(new errors_1.ValidationError("post id is required"));
                return;
            }
            const { data: roadmap, error } = yield this.repo.getUserPostRoadmap(userId, postId);
            if (error) {
                next(error);
                return;
            }
            res.status(200).json({ roadmap });
        });
    }
};
V1PostController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("PostRepository")),
    __metadata("design:paramtypes", [Object])
], V1PostController);
exports.default = V1PostController;
