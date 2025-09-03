"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        delete ret._id;
        delete ret.password;
        return ret;
    },
});
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        this.password = yield (0, hash_password_1.default)(this.password);
        next();
    });
});
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
