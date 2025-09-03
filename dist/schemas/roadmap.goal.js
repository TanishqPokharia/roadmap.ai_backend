"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const roadmap_subgoal_1 = __importDefault(require("./roadmap.subgoal"));
const roadmapGoalSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 100,
    },
    subgoals: {
        type: [roadmap_subgoal_1.default],
        required: true,
        validate: {
            validator: function (v) {
                return v.length > 0; // Ensure at least one subgoal is present
            },
            message: "At least one subgoal is required for each goal.",
        },
    },
});
roadmapGoalSchema.set("toJSON", {
    virtuals: true,
    transform(doc, ret, options) {
        delete ret._id;
        return ret;
    },
});
exports.default = roadmapGoalSchema;
