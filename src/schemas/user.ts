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
