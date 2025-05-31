import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
  Schema,
  Type,
} from "@google/genai";
import { RoadmapRepository } from "../interface";
import RoadmapGoalModel from "../../../models/roadmap.goal";
import Either from "../../../utils/either";
import { injectable } from "tsyringe";

import dotenv from "dotenv";
dotenv.config();
console.log("KEY" + process.env.GEMINI_KEY);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

const responseSchema: Schema = {
  type: Type.ARRAY,
  maxItems: "10",
  items: {
    type: Type.OBJECT,
    properties: {
      goal: {
        type: Type.OBJECT,
        description: "One of the goals to complete in this roadmap.",
        required: ["title", "subgoals"],

        properties: {
          title: {
            type: Type.STRING,
            description: "The title of the goal.",
          },
          subgoals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["title", "description", "duration", "resources"],
              properties: {
                title: {
                  type: Type.STRING,
                  description: "The title of the subgoal.",
                },
                description: {
                  type: Type.STRING,
                  description:
                    "A detailed description of what needs to be done to achieve this subgoal.",
                },
                duration: {
                  type: Type.STRING,
                  description:
                    "Recommended duration to finish this subgoal in days.",
                },
                resources: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING,
                    description:
                      "Resources that can help achieve this subgoal, such as articles, blogs, or videos.",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

@injectable()
class V1RoadmapRepository implements RoadmapRepository {
  async generateRoadmap(topic: string): Promise<Either<RoadmapGoalModel[]>> {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `
    Generate a detailed roadmap for learning: "${topic}".
    
    The roadmap must follow this structure:
    - Multiple main goals (at least 3-5)
    - Each goal must have multiple subgoals (at least 3 per goal)
    - Each subgoal must have a title, detailed description, estimated duration, and helpful resources
    
    Ensure each subgoal includes:
    1. A clear title
    2. A detailed description of at least 2-3 sentences explaining what to learn
    3. Realistic duration (e.g., "2 days", "1 week")
    4. At least 2-3 specific resources with URLs when possible (articles, videos, tutorials)
    
    Make the roadmap comprehensive and logical, covering fundamental to advanced aspects of ${topic}.
    `,
      config: {
        systemInstruction: `
    You are an expert roadmap creator specializing in creating detailed learning paths.
    
    Your responses must:
    1. Always follow the specified JSON schema exactly
    2. Include properly structured goals and subgoals
    3. Provide realistic time estimates for each subgoal
    4. Include specific, relevant resources for each subgoal
    5. Ensure all subgoals have detailed descriptions
    6. Organize content in a logical progression (beginner to advanced)
    7. Cover all critical aspects of the requested topic
    8. Always return valid JSON that matches the schema
    
    Never omit any required fields in the response schema. Always ensure each goal has a title and subgoals array, and each subgoal has title, description, duration, and resources array.
    `,
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
        temperature: 0.1, // Lower temperature for more consistent, structured output
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192, // Ensure we get a full response
      },
    });

    try {
      // Handle possible null or undefined response
      if (!response.text) {
        console.error("Empty response from Gemini API");
        return { data: [], error: new Error("Empty response from AI service") };
      }

      const roadmap = JSON.parse(response.text) as RoadmapGoalModel[];
      // console.log(
      // "Parsed JSON structure:",
      // JSON.stringify(jsonResponse, null, 2)
      // );

      return { data: roadmap, error: null };
    } catch (error) {
      console.error("Error processing API response:", error);
      return {
        data: [],
        error: new Error(`Failed to process API response:`),
      };
    }
  }
}

export default V1RoadmapRepository;
