import mongoose from "mongoose";

const viewsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Post"
    }
});


viewsSchema.index({ userId: 1, postId: 1 }, { unique: true });
viewsSchema.set("toJSON", {
    virtuals: true,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    }
});

const Views = mongoose.model("Views", viewsSchema);
export default Views;