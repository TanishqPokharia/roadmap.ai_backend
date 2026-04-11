import mongoose from "mongoose";
import hashPassword from "../utils/hash.password.js";
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 8,
        maxlength: 20,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        validate: {
            validator: (val) => {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
            },
            message: (props) => `${props.value} is not a valid email!`,
        },
    },
    password: {
        type: String,
        required: true,
        select: false,
        minlength: 8,
        maxlength: 20,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        required: true,
    },
    avatar: {
        type: String,
        default: null,
    },
    provider: {
        type: String,
        required: true,
        default: "default",
        validate: {
            validator: (val) => {
                const validProviders = ["default", "google"];
                if (validProviders.includes(val))
                    return true;
                return false;
            },
            message: (props) => {
                return `${props.value} is not a valid provider`;
            }
        }
    },
    providerId: {
        type: String,
        default: null,
    }
});
userSchema.set("toJSON", {
    virtuals: true,
    transform(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        return ret;
    },
});
userSchema.set("toObject", {
    virtuals: true, transform(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        return ret;
    }
});
userSchema.pre("save", async function (next) {
    this.password = await hashPassword(this.password);
    next();
});
const User = mongoose.model("User", userSchema);
export default User;
