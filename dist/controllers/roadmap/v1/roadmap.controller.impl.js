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
let V1RoadmapController = class V1RoadmapController {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    savePostRoadmap = async (req, res, next) => {
        const userId = req.token;
        const { roadmap, postId } = req.body;
        const savePostRoadmapSchema = z.object({
            userId: z.string().min(1, "User ID is required"),
            roadmap: z.object({
                title: z.string().min(1, "Roadmap title is required").max(100),
                description: z.string().min(10, "Description is required").max(400),
                goals: z.array(z.any()).min(1, "Roadmap must have at least one goal"),
            }),
            postId: z.string().nonempty()
        });
        const validatedMetaData = savePostRoadmapSchema.safeParse({
            userId,
            roadmap,
            postId
        });
        if (!validatedMetaData.success) {
            next(new ValidationError(z.prettifyError(validatedMetaData.error)));
            return;
        }
        const validatedData = validatedMetaData.data;
        const { data: message, error } = await this.repo.savePostRoadmap(validatedData.userId, roadmap, validatedData.postId);
        if (error) {
            next(error);
            return;
        }
        res.status(200).json({ message });
    };
    saveRoadmap = async (req, res, next) => {
        const userId = req.token;
        const { roadmap } = req.body;
        const saveRoadmapSchema = z.object({
            userId: z.string().min(1, "User ID is required."),
            roadmap: z.object({
                title: z.string().min(1, "Roadmap title is required").max(100),
                description: z.string().min(10, "Description is required").max(400),
                goals: z.array(z.any()).min(1, "Roadmap must have at least one goal"),
            }),
        });
        const validatedRoadmap = saveRoadmapSchema.safeParse({
            userId,
            roadmap,
        });
        if (!validatedRoadmap.success) {
            // use next function instead
            next(new ValidationError(z.prettifyError(validatedRoadmap.error)));
            return;
        }
        const validatedData = validatedRoadmap.data;
        const { data: message, error } = await this.repo.saveRoadmap(validatedData.userId, roadmap);
        if (error) {
            next(error);
            return;
        }
        res.status(201).json({ message });
    };
    deleteRoadmap = async (req, res, next) => {
        const { roadmapId } = req.params;
        const { data, error } = await this.repo.deleteRoadmap(roadmapId);
        if (error) {
            next(error);
            return;
        }
        res.status(200).json({ message: "Roadmap deleted successfully." });
    };
    getPrivateRoadmapsMetaData = async (req, res, next) => {
        const userId = req.token;
        const { limit, skip } = req.query;
        const getRoadmapsMetaDataSchema = z.object({
            userId: z.string().nonempty("User ID is required."),
            limit: z.preprocess((val) => Number(val), z.int().nonnegative().optional()),
            skip: z.preprocess((val) => Number(val), z.int().nonnegative().optional()),
        });
        const validateInputs = getRoadmapsMetaDataSchema.safeParse({
            userId,
            limit,
            skip,
        });
        if (!validateInputs.success) {
            next(new ValidationError(z.prettifyError(validateInputs.error)));
            return;
        }
        const validatedData = validateInputs.data;
        const { data: roadmaps, error } = await this.repo.getPrivateRoadmapsMetaData(validatedData.userId, validatedData.limit ?? 10, validatedData.skip ?? 0);
        if (error) {
            next(error);
            return;
        }
        res.status(200).json({ roadmaps });
    };
    getPrivateRoadmap = async (req, res, next) => {
        const userId = req.token;
        const roadmapId = req.params.roadmapId;
        const getPrivateRoadmapSchema = z.object({
            userId: z.string().nonempty("User Id is required"),
            roadmapId: z.string().nonempty("Roadmap Id is required")
        }).required();
        const validateInputs = getPrivateRoadmapSchema.safeParse({
            userId,
            roadmapId
        });
        if (!validateInputs.success) {
            next(new ValidationError(z.prettifyError(validateInputs.error)));
            return;
        }
        const validatedData = validateInputs.data;
        const { data: roadmap, error } = await this.repo.getPrivateRoadmap(validatedData.userId, validatedData.roadmapId);
        if (error) {
            next(error);
            return;
        }
        res.status(200).json({ roadmap });
    };
    setRoadmapSubgoalStatus = async (req, res, next) => {
        const { roadmapId, subgoalId, goalId, status } = req.params;
        const setStatusSchema = z.object({
            status: z.preprocess((val) => val === "true" || val === true, z.boolean().nonoptional()),
            roadmapId: z.string().min(1, "Roadmap ID is required"),
            subgoalId: z.string().min(1, "Subgoal ID is required"),
            goalId: z.string().min(1, "Goal ID is required"),
        });
        const validatedStatus = setStatusSchema.safeParse({
            status,
            roadmapId,
            subgoalId,
            goalId,
        });
        if (!validatedStatus.success) {
            next(new ValidationError(z.prettifyError(validatedStatus.error)));
            return;
        }
        const validatedData = validatedStatus.data;
        console.log(validatedData);
        const { data: message, error } = await this.repo.setRoadmapSubgoalStatus(validatedData.roadmapId, validatedData.goalId, validatedData.subgoalId, validatedData.status);
        if (error) {
            next(error);
            return;
        }
        res.status(200).json({ message });
    };
    generateRoadmap = async (req, res, next) => {
        const { topic } = req.query;
        if (typeof topic !== "string" || topic.trim() === "") {
            next(new ValidationError("Topic is required and must be a non-empty string."));
            return;
        }
        const { data: roadmap, error } = await this.repo.generateRoadmap(topic);
        if (error) {
            next(error);
            return;
        }
        res.status(200).json(roadmap);
    };
};
V1RoadmapController = __decorate([
    injectable(),
    __param(0, inject("RoadmapRepository")),
    __metadata("design:paramtypes", [Object])
], V1RoadmapController);
export default V1RoadmapController;
