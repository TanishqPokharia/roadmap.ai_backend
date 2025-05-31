import mongoose from "mongoose";
import PrivateRoadmap from "./private.roadmap";

const publicRoadmapSchema = new mongoose.Schema({
  data: {
    type: PrivateRoadmap,
    required: true,
  },
  publishedAt: {
    type: Date,
    required: true,
  },
});

const PublicRoadmap = mongoose.model("PublicRoadmap", publicRoadmapSchema);
export default PublicRoadmap;
