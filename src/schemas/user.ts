import mongoose, {
  CallbackWithoutResultAndOptionalError,
  ValidatorProps,
} from "mongoose";
import hashPassword from "../utils/hash.password";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 10,
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

const User = mongoose.model("User", userSchema);
export default User;
