import mongoose, { Schema } from "mongoose";
import UserRoadmapGoal from "./roadmap.goal";

const privateRoadmapSchema: Schema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
  },
  roadmap: {
    type: [UserRoadmapGoal],
    required: true,
  },
});

const PrivateRoadmap = mongoose.model("PrivateRoadmap", privateRoadmapSchema);
export default PrivateRoadmap;
