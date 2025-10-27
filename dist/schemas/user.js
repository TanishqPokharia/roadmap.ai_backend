"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const hash_password_1 = __importDefault(require("../utils/hash.password"));
const userSchema = new mongoose_1.default.Schema({
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
        default: Date.now,
        required: true,
    },
    avatar: {
        type: String,
        default: null,
    },
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
    this.password = await (0, hash_password_1.default)(this.password);
    next();
});
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
