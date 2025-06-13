import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
  Schema,
  Type,
} from "@google/genai";
import { injectable } from "tsyringe";
import logger from "../../../utils/logger";
import IRoadmapRepository from "../roadmap.repository.interface";
import IRoadmap from "../../../models/roadmap";
import Roadmap from "../../../schemas/roadmap";
import DataOrError from "../../../utils/either";
import responseSchema from "../../../utils/generated.roadmap.schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

@injectable()
class V1RoadmapRepository implements IRoadmapRepository {
  async getPrivateRoadmaps(
    userId: string,
    limit: number,
    skip: number
  ): Promise<DataOrError<IRoadmap[]>> {
    try {
      const roadmaps = await Roadmap.find({ userId })
        .limit(limit)
        .sort({ createdAt: -1 })
        .skip(skip)
        .exec();
      return {
        data: roadmaps,
        error: null,
      };
    } catch (error) {
      logger.error(error, "Error getting private roadmaps");
      return {
        data: null,
        error: new Error(
          `Failed to get private roadmaps: ${(error as Error).message}`
        ),
      };
    }
  }
  async saveRoadmap(
    userId: string,
    roadmap: IRoadmap
  ): Promise<DataOrError<string>> {
    try {
      const savedRoamap = await Roadmap.create({
        userId: userId,
        title: roadmap.title,
        goals: roadmap.goals,
      });

      await savedRoamap.save();
      return { data: "Roadmap saved", error: null };
    } catch (error) {
      logger.error(error, "Error saving roadmap:");
      return {
        data: null,
        error: new Error(`Failed to save roadmap: ${(error as Error).message}`),
      };
    }
  }
  async deleteRoadmap(roadmapId: string): Promise<DataOrError<string>> {
    try {
      const result = await Roadmap.deleteOne({ _id: roadmapId }).exec();
      if (result.deletedCount === 0) {
        return { data: null, error: new Error("Roadmap not found") };
      }
      return { data: "Roadmap deleted", error: null };
    } catch (error) {
      logger.error(error, "Error deleting roadmap:");
      return {
        data: null,
        error: new Error(
          `Failed to delete roadmap: ${(error as Error).message}`
        ),
      };
    }
  }

  async setRoadmapSubgoalStatus(
    roadmapId: string,
    goalId: string,
    subgoalId: string,
    status: boolean
  ): Promise<DataOrError<string>> {
    try {
      const roadmap = await Roadmap.findById(roadmapId).exec();
      if (!roadmap) {
        return { data: null, error: new Error("Roadmap not found") };
      }

      const goal = roadmap.goals.find((g) => g._id.equals(goalId));
      if (!goal) {
        return { data: null, error: new Error("Goal not found") };
      }
      const subgoal = goal.subgoals.find((sg) => sg._id.equals(subgoalId));
      if (!subgoal) {
        return { data: null, error: new Error("Subgoal not found") };
      }
      subgoal.status.completed = status;
      subgoal.status.completedAt = status ? new Date() : null;
      roadmap.markModified("goals");
      await roadmap.save();
      return { data: "Subgoal status updated", error: null };
    } catch (error) {
      logger.error(error, "Error setting roadmap subgoal status:");
      return {
        data: null,
        error: new Error(
          `Failed to set subgoal status: ${(error as Error).message}`
        ),
      };
    }
  }
  async generateRoadmap(topic: string): Promise<DataOrError<IRoadmap>> {
    try {
      const contentPrompt = process.env.CONTENT_PROMPT as string;
      const systemInstruction = process.env.SYSTEM_INSTRUCTION as string;
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `
        Generate a detailed roadmap for learning: "${topic}".
    
        ${contentPrompt}
    
        Make the roadmap comprehensive and logical, covering fundamental to advanced aspects of ${topic}.
        `,
        config: {
          systemInstruction: systemInstruction,
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
          ],
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });

      // Handle possible null or undefined response
      if (!response.text) {
        logger.error("Empty response from Gemini API");
        return {
          data: null,
          error: new Error("Empty response from AI service"),
        };
      }

      const roadmap = JSON.parse(response.text) as IRoadmap;

      return { data: roadmap, error: null };
    } catch (error) {
      logger.error(error, "Error processing API response:");
      return {
        data: null,
        error: new Error(`Failed to process API response:`),
      };
    }
  }
}

export default V1RoadmapRepository;
