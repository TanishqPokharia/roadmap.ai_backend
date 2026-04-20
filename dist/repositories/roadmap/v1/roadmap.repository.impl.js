var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { GoogleGenAI, HarmBlockThreshold, HarmCategory, } from "@google/genai";
import { injectable } from "tsyringe";
import Roadmap from "../../../schemas/roadmap.js";
import { AccessDeniedError, DatabaseError, ExternalServiceError, NotFoundError } from "../../../utils/errors.js";
import { logger } from "../../../utils/logger.js";
import responseSchema from "../../../utils/generated.roadmap.schema.js";
import dotenv from 'dotenv';
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
let V1RoadmapRepository = class V1RoadmapRepository {
    async savePostRoadmap(userId, roadmap, postId) {
        try {
            // Ensure all subgoals have a status field with default values
            const processedGoals = roadmap.goals.map(goal => ({
                ...goal,
                subgoals: goal.subgoals.map((subgoal) => ({
                    ...subgoal,
                    status: subgoal.status || { completed: false, completedAt: null }
                }))
            }));
            const savedRoadmap = await Roadmap.create({
                userId,
                goals: processedGoals,
                postId,
                title: roadmap.title,
                description: roadmap.description
            });
            await savedRoadmap.save();
            return {
                data: "Roadmap saved succesfully",
                error: null
            };
        }
        catch (error) {
            logger.error("Error saving posted roadmap");
            return {
                data: null,
                error: new DatabaseError(`Failed to save posted roadmap : ${error.message}`)
            };
        }
    }
    async getPrivateRoadmap(userId, roadmapId) {
        try {
            const roadmap = await Roadmap.findById(roadmapId);
            if (!roadmap) {
                return {
                    data: null,
                    error: new NotFoundError("Roadmap does not exist")
                };
            }
            if (roadmap.userId.toString() !== userId) {
                return {
                    data: null,
                    error: new AccessDeniedError("Access Denied")
                };
            }
            return {
                data: roadmap,
                error: null
            };
        }
        catch (error) {
            logger.error(error, "Error getting private roadmap");
            return {
                data: null,
                error: new DatabaseError(`Failed to get roadmap: ${error.message}`)
            };
        }
    }
    async getPrivateRoadmapsMetaData(userId, limit, skip) {
        try {
            const roadmaps = await Roadmap.find({ userId })
                .limit(limit)
                .sort({ createdAt: -1 })
                .skip(skip)
                .exec();
            // process roadmaps into roadmap meta data
            const roadmapsMetaData = roadmaps.map((r) => {
                return {
                    id: r._id.toString(),
                    title: r.title,
                    description: r.description,
                    postId: r.postId ? r.postId.toString() : null,
                    goalsCount: r.goals.length,
                    subgoalsCount: r.goals.reduce((acc, goal) => acc + goal.subgoals.length, 0),
                    completedSubgoals: r.goals.reduce((acc, goal) => {
                        const completedSubgoals = goal.subgoals.filter((sg) => sg.status.completed).length;
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
            logger.error(error, "Error getting private roadmaps");
            return {
                data: null,
                error: new DatabaseError(`Failed to get private roadmaps: ${error.message}`)
            };
        }
    }
    async saveRoadmap(userId, roadmap) {
        try {
            // Ensure all subgoals have a status field with default values
            const processedGoals = roadmap.goals.map(goal => ({
                ...goal,
                subgoals: goal.subgoals.map((subgoal) => ({
                    ...subgoal,
                    status: subgoal.status || { completed: false, completedAt: null }
                }))
            }));
            const savedRoadmap = await Roadmap.create({
                userId: userId,
                title: roadmap.title,
                description: roadmap.description,
                goals: processedGoals,
            });
            await savedRoadmap.save();
            return { data: "Roadmap saved successfully", error: null };
        }
        catch (error) {
            logger.error(error, "Error saving roadmap:");
            return {
                data: null,
                error: new DatabaseError(`Failed to save roadmap: ${error.message}`)
            };
        }
    }
    async deleteRoadmap(roadmapId) {
        try {
            const result = await Roadmap.deleteOne({ _id: roadmapId }).exec();
            if (result.deletedCount === 0) {
                return { data: null, error: new NotFoundError("Roadmap not found") };
            }
            return { data: "Roadmap deleted successfully", error: null };
        }
        catch (error) {
            logger.error(error, "Error deleting roadmap:");
            return {
                data: null,
                error: new DatabaseError(`Failed to delete roadmap: ${error.message}`)
            };
        }
    }
    async setRoadmapSubgoalStatus(roadmapId, goalId, subgoalId, status) {
        try {
            const roadmap = await Roadmap.findById(roadmapId).exec();
            if (!roadmap) {
                return { data: null, error: new NotFoundError("Roadmap not found") };
            }
            const goal = roadmap.goals.find((g) => g._id.toString() === goalId);
            if (!goal) {
                return { data: null, error: new NotFoundError("Goal not found") };
            }
            const subgoal = goal.subgoals.find((sg) => sg._id.toString() === subgoalId);
            if (!subgoal) {
                return { data: null, error: new NotFoundError("Subgoal not found") };
            }
            subgoal.status.completed = status;
            subgoal.status.completedAt = status ? new Date() : null;
            // notify mongoose that the subdocument has been modified
            roadmap.markModified("goals");
            await roadmap.save();
            return { data: "Subgoal status updated successfully", error: null };
        }
        catch (error) {
            logger.error(error, "Error setting roadmap subgoal status:");
            return {
                data: null,
                error: new DatabaseError(`Failed to set subgoal status: ${error.message}`)
            };
        }
    }
    async generateRoadmap(topic) {
        try {
            const contentPrompt = process.env.CONTENT_PROMPT;
            const systemInstruction = process.env.SYSTEM_INSTRUCTION;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Generate a concise but comprehensive roadmap for learning: "${topic}". ${contentPrompt}. Focus on essential milestones and key learning paths.`,
                config: {
                    systemInstruction: systemInstruction,
                    safetySettings: [
                        {
                            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                        },
                        {
                            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                        },
                        {
                            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                        },
                        {
                            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                        },
                    ],
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                    temperature: 0.1,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 4096, // Reduced from 8192 for faster response
                },
            });
            // Handle possible null or undefined response
            if (!response.text) {
                logger.error("Empty response from Gemini API");
                return {
                    data: null,
                    error: new ExternalServiceError("Empty response from AI service")
                };
            }
            const roadmap = JSON.parse(response.text);
            return { data: roadmap, error: null };
        }
        catch (error) {
            logger.error(error, "Error processing roadmap API response:");
            return {
                data: null,
                error: new ExternalServiceError(`Failed to process roadmap generation response: ${error.message}`)
            };
        }
    }
};
V1RoadmapRepository = __decorate([
    injectable()
], V1RoadmapRepository);
export default V1RoadmapRepository;
