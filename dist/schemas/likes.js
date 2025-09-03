"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const likesSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, ref: "User" },
    postId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, ref: "Post" },
});
likesSchema.index({ userId: 1, postId: 1 }, { unique: true });
likesSchema.set("toJSON", {
    virtuals: true,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    },
});
const Likes = mongoose_1.default.model("Likes", likesSchema);
exports.default = Likes;
