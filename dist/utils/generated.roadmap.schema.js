"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const genai_1 = require("@google/genai");
const responseSchema = {
    type: genai_1.Type.OBJECT,
    required: ["roadmap"],
    properties: {
        roadmap: {
            type: genai_1.Type.OBJECT,
            required: ["title", "description", "goals"],
            properties: {
                title: {
                    type: genai_1.Type.STRING,
                    description: "The title of the roadmap.",
                    minLength: "10",
                    maxLength: "60",
                },
                description: {
                    type: genai_1.Type.STRING,
                    description: "A brief description of the roadmap.",
                    minLength: "10",
                    maxLength: "200",
                },
                goals: {
                    type: genai_1.Type.ARRAY,
                    description: "Array of goals to complete in this roadmap.",
                    minItems: "1",
                    items: {
                        type: genai_1.Type.OBJECT,
                        required: ["title", "subgoals"],
                        properties: {
                            title: {
                                type: genai_1.Type.STRING,
                                description: "The title of the goal to be completed.",
                                minLength: "10",
                                maxLength: "100",
                            },
                            subgoals: {
                                type: genai_1.Type.ARRAY,
                                description: "Array of subgoals to complete in this goal.",
                                minItems: "1",
                                items: {
                                    type: genai_1.Type.OBJECT,
                                    required: ["title", "description", "duration", "resources"],
                                    properties: {
                                        title: {
                                            type: genai_1.Type.STRING,
                                            description: "The title of the subgoal.",
                                        },
                                        description: {
                                            type: genai_1.Type.STRING,
                                            description: "A detailed description of what needs to be done to achieve this subgoal.",
                                        },
                                        duration: {
                                            type: genai_1.Type.STRING,
                                            description: "Recommended duration to finish this subgoal in days, weeks, or months only.",
                                        },
                                        resources: {
                                            type: genai_1.Type.ARRAY,
                                            items: {
                                                type: genai_1.Type.STRING,
                                                description: "Resources that can help achieve this subgoal, such as articles, blogs, or videos.",
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
exports.default = responseSchema;
