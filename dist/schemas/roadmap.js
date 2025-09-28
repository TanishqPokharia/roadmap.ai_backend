"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roadmapSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const roadmap_goal_1 = __importDefault(require("./roadmap.goal"));
exports.roadmapSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    postId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        default: null,
    },
    title: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 100,
    },
    description: {
        type: String,
        required: true,
    },
    goals: {
        type: [roadmap_goal_1.default],
        required: true,
    },
});
exports.roadmapSchema.set("toJSON", {
    virtuals: true,
    transform(doc, ret, options) {
        delete ret._id;
        return ret;
    },
});
const Roadmap = mongoose_1.default.model("Roadmap", exports.roadmapSchema);
exports.default = Roadmap;
