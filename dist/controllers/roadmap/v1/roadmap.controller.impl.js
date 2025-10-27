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
const logger_1 = require("../../../utils/logger");
const v4_1 = require("zod/v4");
const errors_1 = require("../../../utils/errors");
let V1RoadmapController = class V1RoadmapController {
    constructor(repo) {
        this.repo = repo;
        this.saveRoadmap = async (req, res, next) => {
            const userId = req.token;
            const { roadmap } = req.body;
            const saveRoadmapSchema = v4_1.z.object({
                userId: v4_1.z.string().min(1, "User ID is required."),
                roadmap: v4_1.z.object({
                    title: v4_1.z.string().min(1, "Roadmap title is required").max(100),
                    description: v4_1.z.string().min(10, "Description is required").max(400),
                    goals: v4_1.z.array(v4_1.z.any()).min(1, "Roadmap must have at least one goal"),
                }),
            });
            const validatedRoadmap = saveRoadmapSchema.safeParse({
                userId,
                roadmap,
            });
            if (!validatedRoadmap.success) {
                // use next function instead
                next(new errors_1.ValidationError(v4_1.z.prettifyError(validatedRoadmap.error)));
                return;
            }
            const validated = validatedRoadmap.data;
            const { data: message, error } = await this.repo.saveRoadmap(validated.userId, roadmap);
            if (error) {
                next(error);
                return;
            }
            res.status(201).json({ message });
        };
        this.deleteRoadmap = async (req, res, next) => {
            const { roadmapId } = req.params;
            const { data, error } = await this.repo.deleteRoadmap(roadmapId);
            if (error) {
                next(error);
                return;
            }
            res.status(200).json({ message: "Roadmap deleted successfully." });
        };
        this.getPrivateRoadmapsMetaData = async (req, res, next) => {
            var _a, _b;
            const userId = req.token;
            const { limit, skip } = req.query;
            const getRoadmapsMetaDataSchema = v4_1.z.object({
                userId: v4_1.z.string().nonempty("User ID is required."),
                limit: v4_1.z.preprocess((val) => Number(val), v4_1.z.int().nonnegative().optional()),
                skip: v4_1.z.preprocess((val) => Number(val), v4_1.z.int().nonnegative().optional()),
            });
            const validateInputs = getRoadmapsMetaDataSchema.safeParse({
                userId,
                limit,
                skip,
            });
            if (!validateInputs.success) {
                next(new errors_1.ValidationError(v4_1.z.prettifyError(validateInputs.error)));
                return;
            }
            const validated = validateInputs.data;
            const { data: roadmaps, error } = await this.repo.getPrivateRoadmapsMetaData(validated.userId, (_a = validated.limit) !== null && _a !== void 0 ? _a : 10, (_b = validated.skip) !== null && _b !== void 0 ? _b : 0);
            if (error) {
                next(error);
                return;
            }
            res.status(200).json({ roadmaps });
        };
        this.getPrivateRoadmap = async (req, res, next) => {
            const userId = req.token;
            const roadmapId = req.params.roadmapId;
            const getPrivateRoadmapSchema = v4_1.z.object({
                userId: v4_1.z.string().nonempty("User Id is required"),
                roadmapId: v4_1.z.string().nonempty("Roadmap Id is required")
            }).required();
            const validateInputs = getPrivateRoadmapSchema.safeParse({
                userId,
                roadmapId
            });
            if (!validateInputs.success) {
                next(new errors_1.ValidationError(v4_1.z.prettifyError(validateInputs.error)));
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
        this.setRoadmapSubgoalStatus = async (req, res, next) => {
            const { roadmapId, subgoalId, goalId, status } = req.params;
            const setStatusSchema = v4_1.z.object({
                status: v4_1.z.preprocess((val) => val === "true" || val === true, v4_1.z.boolean().nonoptional()),
                roadmapId: v4_1.z.string().min(1, "Roadmap ID is required"),
                subgoalId: v4_1.z.string().min(1, "Subgoal ID is required"),
                goalId: v4_1.z.string().min(1, "Goal ID is required"),
            });
            const validatedStatus = setStatusSchema.safeParse({
                status,
                roadmapId,
                subgoalId,
                goalId,
            });
            if (!validatedStatus.success) {
                next(new errors_1.ValidationError(v4_1.z.prettifyError(validatedStatus.error)));
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
        this.generateRoadmap = async (req, res, next) => {
            logger_1.logger.info("Generating roadmap...");
            const { topic } = req.query;
            if (typeof topic !== "string" || topic.trim() === "") {
                next(new errors_1.ValidationError("Topic is required and must be a non-empty string."));
                return;
            }
            const { data: roadmap, error } = await this.repo.generateRoadmap(topic);
            if (error) {
                next(error);
                return;
            }
            res.status(200).json(roadmap);
        };
    }
};
V1RoadmapController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("RoadmapRepository")),
    __metadata("design:paramtypes", [Object])
], V1RoadmapController);
exports.default = V1RoadmapController;
