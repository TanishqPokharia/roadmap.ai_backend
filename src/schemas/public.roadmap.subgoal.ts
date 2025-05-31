import mongoose from "mongoose";

const publicRoadmapSubgoalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  resources: {
    type: [String],
    required: true,
  },
});

const PublicRoadmapSubgoal = mongoose.model(
  "PublicRoadmapSubgoal",
  publicRoadmapSubgoalSchema
);
export default PublicRoadmapSubgoal;
