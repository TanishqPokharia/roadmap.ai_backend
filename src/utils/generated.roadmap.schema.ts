import { Schema, Type } from "@google/genai";

const responseSchema: Schema = {
  type: Type.OBJECT,
  required: ["title", "roadmap"],
  properties: {
    title: {
      type: Type.STRING,
      description: "The title of the roadmap.",
      maximum: 50,
    },
    roadmap: {
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
    },
  },
};

export default responseSchema;
