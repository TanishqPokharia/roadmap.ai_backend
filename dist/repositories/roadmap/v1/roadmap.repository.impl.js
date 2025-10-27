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
const genai_1 = require("@google/genai");
const tsyringe_1 = require("tsyringe");
const logger_1 = require("../../../utils/logger");
const roadmap_1 = __importDefault(require("../../../schemas/roadmap"));
const generated_roadmap_schema_1 = __importDefault(require("../../../utils/generated.roadmap.schema"));
const errors_1 = require("../../../utils/errors");
const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
let V1RoadmapRepository = class V1RoadmapRepository {
    async getPrivateRoadmap(userId, roadmapId) {
        try {
            const roadmap = await roadmap_1.default.findById(roadmapId);
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
    }
    async getPrivateRoadmapsMetaData(userId, limit, skip) {
        try {
            const roadmaps = await roadmap_1.default.find({ userId })
                .limit(limit)
                .sort({ createdAt: -1 })
                .skip(skip)
                .exec();
            // process roadmaps into roadmap meta data
            const roadmapsMetaData = roadmaps.map(r => {
                return {
                    id: r._id.toString(),
                    title: r.title,
                    description: r.description,
                    postId: r.postId ? r.postId.toString() : null,
                    goalsCount: r.goals.length,
                    subgoalsCount: r.goals.reduce((acc, goal) => acc + goal.subgoals.length, 0),
                    completedSubgoals: r.goals.reduce((acc, goal) => {
                        const completedSubgoals = goal.subgoals.filter(sg => sg.status.completed).length;
                        return acc + completedSubgoals;
                    }, 0)
                };
            });
            return {
                data: roadmapsMetaData,
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
    }
    async saveRoadmap(userId, roadmap) {
        try {
            // Ensure all subgoals have a status field with default values
            const processedGoals = roadmap.goals.map(goal => (Object.assign(Object.assign({}, goal), { subgoals: goal.subgoals.map(subgoal => (Object.assign(Object.assign({}, subgoal), { status: subgoal.status || { completed: false, completedAt: null } }))) })));
            const savedRoadmap = await roadmap_1.default.create({
                userId: userId,
                title: roadmap.title,
                description: roadmap.description,
                goals: processedGoals,
            });
            await savedRoadmap.save();
            return { data: "Roadmap saved successfully", error: null };
        }
        catch (error) {
            logger_1.logger.error(error, "Error saving roadmap:");
            return {
                data: null,
                error: new errors_1.DatabaseError(`Failed to save roadmap: ${error.message}`)
            };
        }
    }
    async deleteRoadmap(roadmapId) {
        try {
            const result = await roadmap_1.default.deleteOne({ _id: roadmapId }).exec();
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
    }
    async setRoadmapSubgoalStatus(roadmapId, goalId, subgoalId, status) {
        try {
            const roadmap = await roadmap_1.default.findById(roadmapId).exec();
            if (!roadmap) {
                return { data: null, error: new errors_1.NotFoundError("Roadmap not found") };
            }
            const goal = roadmap.goals.find((g) => g._id.toString() === goalId);
            if (!goal) {
                return { data: null, error: new errors_1.NotFoundError("Goal not found") };
            }
            const subgoal = goal.subgoals.find((sg) => sg._id.toString() === subgoalId);
            if (!subgoal) {
                return { data: null, error: new errors_1.NotFoundError("Subgoal not found") };
            }
            subgoal.status.completed = status;
            subgoal.status.completedAt = status ? new Date() : null;
            // notify mongoose that the subdocument has been modified
            roadmap.markModified("goals");
            await roadmap.save();
            return { data: "Subgoal status updated successfully", error: null };
        }
        catch (error) {
            logger_1.logger.error(error, "Error setting roadmap subgoal status:");
            return {
                data: null,
                error: new errors_1.DatabaseError(`Failed to set subgoal status: ${error.message}`)
            };
        }
    }
    async generateRoadmap(topic) {
        try {
            const contentPrompt = process.env.CONTENT_PROMPT;
            const systemInstruction = process.env.SYSTEM_INSTRUCTION;
            const response = await ai.models.generateContent({
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
    }
};
V1RoadmapRepository = __decorate([
    (0, tsyringe_1.injectable)()
], V1RoadmapRepository);
exports.default = V1RoadmapRepository;
