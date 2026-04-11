import mongoose from "mongoose";
import roadmapGoalSchema from "./roadmap.goal.js";
export const roadmapSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
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
        type: [roadmapGoalSchema],
        required: true,
    },
});
roadmapSchema.set("toJSON", {
    virtuals: true,
    transform(doc, ret, options) {
        delete ret._id;
        return ret;
    },
});
const Roadmap = mongoose.model("Roadmap", roadmapSchema);
export default Roadmap;
