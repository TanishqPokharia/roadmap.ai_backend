import mongoose from "mongoose";
import IRoadmapGoal from "../models/roadmap.goal";
import { roadmapSchema } from "./roadmap";
import roadmapSubgoalSchema from "./roadmap.subgoal";

type RoadmapGoalDocument = mongoose.Document & IRoadmapGoal;

const roadmapGoalSchema = new mongoose.Schema<RoadmapGoalDocument>({
  title: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 100,
  },
  subgoals: {
    type: [roadmapSubgoalSchema],
    required: true,
    validate: {
      validator: function (v: any[]) {
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
export default roadmapGoalSchema;
