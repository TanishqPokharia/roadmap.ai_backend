import { Schema, Type } from "@google/genai";

const responseSchema: Schema = {
  type: Type.OBJECT,
  required: ["roadmap"],
  properties: {
    roadmap: {
      type: Type.OBJECT,
      required: ["title", "description", "goals"],
      properties: {
        title: {
          type: Type.STRING,
          description: "The title of the roadmap.",
          minLength: "10",
          maxLength: "60",
        },
        description: {
          type: Type.STRING,
          description: "A brief description of the roadmap.",
          minLength: "10",
          maxLength: "200",
        },
        goals: {
          type: Type.ARRAY,
          description: "Array of goals to complete in this roadmap.",
          minItems: "1",
          items: {
            type: Type.OBJECT,
            required: ["title", "subgoals"],
            properties: {
              title: {
                type: Type.STRING,
                description: "The title of the goal to be completed.",
                minLength: "10",
                maxLength: "100",
              },
              subgoals: {
                type: Type.ARRAY,
                description: "Array of subgoals to complete in this goal.",
                minItems: "1",
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
                        "Recommended duration to finish this subgoal in days, weeks, or months only.",
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
    },
  },
};
export default responseSchema;
