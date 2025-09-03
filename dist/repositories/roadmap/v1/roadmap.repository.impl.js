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
const genai_1 = require("@google/genai");
const tsyringe_1 = require("tsyringe");
const logger_1 = require("../../../utils/logger");
const roadmap_1 = __importDefault(require("../../../schemas/roadmap"));
const generated_roadmap_schema_1 = __importDefault(require("../../../utils/generated.roadmap.schema"));
const errors_1 = require("../../../utils/errors");
const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
let V1RoadmapRepository = class V1RoadmapRepository {
    getPrivateRoadmap(userId, roadmapId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const roadmap = yield roadmap_1.default.findById(roadmapId);
                if (!roadmap) {
                    return {
                        data: null,
                        error: new errors_1.NotFoundError("Roadmap does not exist")
                    };
                }
                if (roadmap.userId.toString() !== userId) {
                    return {
                        data: null,
                        error: new errors_1.AccessDeniedError("Access Denied")
                    };
                }
                return {
                    data: roadmap,
                    error: null
                };
            }
            catch (error) {
                logger_1.logger.error(error, "Error getting private roadmap");
                return {
                    data: null,
                    error: new errors_1.DatabaseError(`Failed to get roadmap: ${error.message}`)
                };
            }
        });
    }
    getPrivateRoadmapsMetaData(userId, limit, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const roadmaps = yield roadmap_1.default.find({ userId })
                    .select({
                    goals: 0 // remove the goals, just send meta data
                })
                    .limit(limit)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .exec();
                return {
                    data: roadmaps,
                    error: null
                };
            }
            catch (error) {
                logger_1.logger.error(error, "Error getting private roadmaps");
                return {
                    data: null,
                    error: new errors_1.DatabaseError(`Failed to get private roadmaps: ${error.message}`)
                };
            }
        });
    }
    saveRoadmap(userId, roadmap) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const savedRoadmap = yield roadmap_1.default.create({
                    userId: userId,
                    title: roadmap.title,
                    description: roadmap.description,
                    goals: roadmap.goals,
                });
                yield savedRoadmap.save();
                return { data: "Roadmap saved successfully", error: null };
            }
            catch (error) {
                logger_1.logger.error(error, "Error saving roadmap:");
                return {
                    data: null,
                    error: new errors_1.DatabaseError(`Failed to save roadmap: ${error.message}`)
                };
            }
        });
    }
    deleteRoadmap(roadmapId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield roadmap_1.default.deleteOne({ _id: roadmapId }).exec();
                if (result.deletedCount === 0) {
                    return { data: null, error: new errors_1.NotFoundError("Roadmap not found") };
                }
                return { data: "Roadmap deleted successfully", error: null };
            }
            catch (error) {
                logger_1.logger.error(error, "Error deleting roadmap:");
                return {
                    data: null,
                    error: new errors_1.DatabaseError(`Failed to delete roadmap: ${error.message}`)
                };
            }
        });
    }
    setRoadmapSubgoalStatus(roadmapId, goalId, subgoalId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const roadmap = yield roadmap_1.default.findById(roadmapId).exec();
                if (!roadmap) {
                    return { data: null, error: new errors_1.NotFoundError("Roadmap not found") };
                }
                const goal = roadmap.goals.find((g) => g._id.equals(goalId));
                if (!goal) {
                    return { data: null, error: new errors_1.NotFoundError("Goal not found") };
                }
                const subgoal = goal.subgoals.find((sg) => sg._id.equals(subgoalId));
                if (!subgoal) {
                    return { data: null, error: new errors_1.NotFoundError("Subgoal not found") };
                }
                subgoal.status.completed = status;
                subgoal.status.completedAt = status ? new Date() : null;
                roadmap.markModified("goals");
                yield roadmap.save();
                return { data: "Subgoal status updated successfully", error: null };
            }
            catch (error) {
                logger_1.logger.error(error, "Error setting roadmap subgoal status:");
                return {
                    data: null,
                    error: new errors_1.DatabaseError(`Failed to set subgoal status: ${error.message}`)
                };
            }
        });
    }
    generateRoadmap(topic) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contentPrompt = process.env.CONTENT_PROMPT;
                const systemInstruction = process.env.SYSTEM_INSTRUCTION;
                const response = yield ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: `
        Generate a detailed roadmap for learning: "${topic}".
    
        ${contentPrompt}
    
        Make the roadmap comprehensive and logical, covering fundamental to advanced aspects of ${topic}.
        `,
                    config: {
                        systemInstruction: systemInstruction,
                        safetySettings: [
                            {
                                category: genai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                                threshold: genai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                            },
                            {
                                category: genai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                                threshold: genai_1.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                            },
                            {
                                category: genai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                                threshold: genai_1.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                            },
                            {
                                category: genai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
                                threshold: genai_1.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                            },
                        ],
                        responseMimeType: "application/json",
                        responseSchema: generated_roadmap_schema_1.default,
                        temperature: 0.1,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 8192,
                    },
                });
                // Handle possible null or undefined response
                if (!response.text) {
                    logger_1.logger.error("Empty response from Gemini API");
                    return {
                        data: null,
                        error: new errors_1.ExternalServiceError("Empty response from AI service")
                    };
                }
                const roadmap = JSON.parse(response.text);
                return { data: roadmap, error: null };
            }
            catch (error) {
                logger_1.logger.error(error, "Error processing API response:");
                return {
                    data: null,
                    error: new errors_1.ExternalServiceError(`Failed to process API response: ${error.message}`)
                };
            }
        });
    }
};
V1RoadmapRepository = __decorate([
    (0, tsyringe_1.injectable)()
], V1RoadmapRepository);
exports.default = V1RoadmapRepository;
