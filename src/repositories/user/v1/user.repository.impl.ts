import AuthResponse from "../../../models/auth.response";
import User from "../../../schemas/user";
import DataOrError from "../../../utils/either";
import IUserRepository from "../user.repository.interface";
import createAccessToken from "../../../utils/create.access.token";
import createRefreshToken from "../../../utils/create.refresh.toke";
import { injectable } from "tsyringe";
import { logger } from "../../../utils/logger";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary";
import { NotFoundError, ValidationError, DatabaseError, ExternalServiceError } from "../../../utils/errors";
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
            error: new ValidationError("Email already exists"),
            data: null,
          };
        }
        if (existingUser.username === username) {
          return {
            error: new ValidationError("Username already exists"),
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
      logger.error(error, "Error during signup");
      return {
        error: new DatabaseError(`Failed to create user: ${(error as Error).message}`),
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
          error: new NotFoundError("User not found"),
        };
      }

      const isCorrectPassword = await bcrypt.compare(password, user.password);

      if (!isCorrectPassword) {
        return {
          data: null,
          error: new ValidationError("Incorrect password"),
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
      logger.error(error, "Error during login");
      return {
        data: null,
        error: new DatabaseError(`Login failed: ${(error as Error).message}`),
      };
    }
  }

  async refresh(refreshToken: string): Promise<DataOrError<AuthResponse>> {
    try {
      const secret = process.env.REFRESH_TOKEN_SECRET as string;
      const decoded = jwt.verify(refreshToken, secret) as { userId: string };
      const accessToken = createAccessToken(decoded.userId);
      const newRefreshToken = createRefreshToken(decoded.userId);
      return {
        data: {
          accessToken,
          refreshToken: newRefreshToken,
        },
        error: null,
      };
    } catch (error) {
      logger.error(error, "Error refreshing token");
      return {
        data: null,
        error: new ValidationError(
          `Invalid refresh token: ${(error as Error).message}`
        ),
      };
    }
  }
  async uploadAvatar(
    userId: string,
    avatar: Buffer
  ): Promise<DataOrError<string>> {
    try {
      const options: UploadApiOptions = {
        unique_filename: false,
        overwrite: true,
        public_id: userId,
        folder: "roadmap_ai/avatars",
        transformation: [
          { width: 200, height: 200, crop: "fill" },
          { quality: "auto", fetch_format: "auto" },
        ],
        resource_type: "image",
        use_filename: false,
      };
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(options, (error, result) => {
            if (error) {
              logger.error(error, "Error uploading avatar to Cloudinary");
              return reject(error);
            } else {
              if (!result) {
                logger.error("No result returned from Cloudinary upload");
                return reject(
                  new Error("No result returned from Cloudinary upload")
                );
              }
              return resolve(result!);
            }
          })
          .end(avatar);
      });
      await User.findByIdAndUpdate(
        userId,
        { avatar: result.secure_url },
        { new: true, fields: "avatar", upsert: true }
      ).exec();
      return {
        data: result.secure_url,
        error: null,
      };
    } catch (error) {
      logger.error(error, "Error uploading avatar");
      return {
        data: null,
        error: new ExternalServiceError(
          "Failed to update avatar: " + (error as Error).message
        ),
      };
    }
  }
}

export default V1UserRepository;
