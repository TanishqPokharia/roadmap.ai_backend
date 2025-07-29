import mongoose from "mongoose";

const likesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  postId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Post" },
});

likesSchema.index({ userId: 1, postId: 1 }, { unique: true });
likesSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

const Likes = mongoose.model("Likes", likesSchema);
export default Likes;
