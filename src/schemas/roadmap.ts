import mongoose from "mongoose";
import IRoadmap from "../models/roadmap";
import roadmapGoalSchema from "./roadmap.goal";

type RoadmapDocument = mongoose.Document & IRoadmap;

export const roadmapSchema = new mongoose.Schema<RoadmapDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 100,
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
const Roadmap = mongoose.model<RoadmapDocument>("Roadmap", roadmapSchema);
export default Roadmap;
