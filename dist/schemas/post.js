"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const roadmap_1 = require("./roadmap");
const postSchema = new mongoose_1.default.Schema({
    roadmap: {
        type: roadmap_1.roadmapSchema,
        required: true,
    },
    likes: {
        type: Number,
        default: 0,
    },
    bannerImage: {
        type: String,
        default: null
    },
    views: {
        type: Number,
        default: 0
    },
    authorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        index: true,
        required: true,
        ref: "User",
    },
    createdAt: { type: Date, default: Date.now },
});
postSchema.virtual("author", {
    ref: "User",
    localField: "authorId",
    foreignField: "_id",
    justOne: true,
    options: {
        select: "username email avatar",
    }
});
postSchema.virtual("isLiked", {
    ref: "Likes",
    localField: "_id",
    foreignField: "postId",
    justOne: true,
    options: {
        select: "userId"
    }
});
postSchema.set("toJSON", {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        ret.title = ret.roadmap.title;
        ret.description = ret.roadmap.description;
        if (ret.isLiked) {
            ret.isLiked = true;
        }
        else {
            ret.isLiked = false;
        }
        delete ret.roadmap;
        delete ret._id;
        return ret;
    }
});
postSchema.set("toObject", { virtuals: true });
const Post = mongoose_1.default.model("Post", postSchema);
exports.default = Post;
