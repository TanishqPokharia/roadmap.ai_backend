import mongoose, {
  CallbackWithoutResultAndOptionalError,
  ValidatorProps,
} from "mongoose";
import hashPassword from "../utils/hash.password";
import IUser from "../models/user";

export type UserDocument = mongoose.Document & IUser;

const userSchema = new mongoose.Schema<UserDocument>({
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
      validator: (val: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      },
      message: (props: ValidatorProps) =>
        `${props.value} is not a valid email!`,
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

userSchema.pre(
  "save",
  async function (next: CallbackWithoutResultAndOptionalError) {
    this.password = await hashPassword(this.password);
    next();
  }
);

const User = mongoose.model<UserDocument>("User", userSchema);

export default User;
