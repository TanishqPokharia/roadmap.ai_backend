import AuthResponse from "../../../models/auth.response";
import User from "../../../schemas/user";
import DataOrError from "../../../utils/either";
import IUserRepository from "../user.repository.interface";
import createAccessToken from "../../../utils/create.access.token";
import createRefreshToken from "../../../utils/create.refresh.toke";
import { injectable } from "tsyringe";
import hashPassword from "../../../utils/hash.password";
import logger from "../../../utils/logger";
import bcrypt from "bcrypt";

@injectable()
class V1UserRepository implements IUserRepository {
  async signUp(
    username: string,
    email: string,
    password: string
  ): Promise<DataOrError<AuthResponse>> {
    try {
      // search if email already registered
      const existingUser = await User.findOne(
        {
          $or: [{ email }, { username }],
        },
        "email username"
      ).exec();
      if (existingUser) {
        if (existingUser.email === email) {
          return {
            error: new Error("Email already exists"),
            data: null,
          };
        }
        if (existingUser.username === username) {
          return {
            error: new Error("Username already exists"),
            data: null,
          };
        }
      }

      // sign up the user and return the tokens
      const user = new User({
        username,
        email,
        password,
      });

      const savedUser = await user.save();
      const accessToken = createAccessToken(savedUser._id.toString());
      const refreshToken = createRefreshToken(savedUser._id.toString());

      return {
        error: null,
        data: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      return {
        error: error as Error,
        data: null,
      };
    }
  }
  async login(
    email: string,
    password: string
  ): Promise<DataOrError<AuthResponse>> {
    try {
      const user = await User.findOne({ email }, "_id email password").exec();
      if (!user) {
        return {
          data: null,
          error: new Error("User not found"),
        };
      }

      const isCorrectPassword = await bcrypt.compare(password, user.password);

      if (!isCorrectPassword) {
        return {
          data: null,
          error: new Error("Incorrect password"),
        };
      }
      const accessToken = createAccessToken(user._id.toString());
      const refreshToken = createRefreshToken(user._id.toString());
      return {
        data: {
          accessToken,
          refreshToken,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }
}

export default V1UserRepository;
