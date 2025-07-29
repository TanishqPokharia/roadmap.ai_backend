import mongoose from "mongoose";
import IRoadmapSubgoal from "../models/roadmap.subgoal";

type RoadmapSubgoalDocument = mongoose.Document & IRoadmapSubgoal;
type RoadmapSubgoalStatusDocument = mongoose.Document & {
  completed: boolean;
  completedAt: Date | null;
};

const roadmapSubgoalStatusSchema =
  new mongoose.Schema<RoadmapSubgoalStatusDocument>({
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

const roadmapSubgoalSchema = new mongoose.Schema<RoadmapSubgoalDocument>({
  title: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    minlength: 20,
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

export default roadmapSubgoalSchema;
