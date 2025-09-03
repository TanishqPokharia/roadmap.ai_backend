"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const roadmapSubgoalStatusSchema = new mongoose_1.default.Schema({
    completed: {
        type: Boolean,
        default: false,
        required: true,
    },
    completedAt: {
        type: Date,
        default: null,
    },
});
const roadmapSubgoalSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 100,
    },
    description: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 500,
    },
    duration: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 10,
    },
    resources: {
        type: [String],
        required: true,
    },
    status: {
        type: roadmapSubgoalStatusSchema,
        default: { completed: false, completedAt: null },
        required: true,
    },
});
roadmapSubgoalStatusSchema.set("toJSON", {
    virtuals: true,
    transform(doc, ret, options) {
        delete ret._id;
        return ret;
    },
});
roadmapSubgoalSchema.set("toJSON", {
    virtuals: true,
    transform(doc, ret, options) {
        delete ret._id;
        return ret;
    },
});
roadmapSubgoalSchema.pre("save", function (next) {
    if (!this.status.completed) {
        this.status.completed = false;
    }
    if (this.status.completedAt === undefined) {
        this.status.completedAt = null;
    }
    next();
});
exports.default = roadmapSubgoalSchema;
