import mongoose from "mongoose";
import roadmapSubgoalSchema from "./roadmap.subgoal.js";
const roadmapGoalSchema = new mongoose.Schema({
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
            validator: function (v) {
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
