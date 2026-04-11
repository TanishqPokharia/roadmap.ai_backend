import AuthResponse from "../../../models/auth.response";
import User from "../../../schemas/user";
import DataOrError from "../../../utils/data.or.error";
import IUserRepository from "../user.repository.interface";
import createAccessToken from "../../../utils/create.access.token";
import createRefreshToken from "../../../utils/create.refresh.token";
import { injectable } from "tsyringe";
import { logger } from "../../../utils/logger";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary";
import { NotFoundError, ValidationError as TokenValidationError, DatabaseError, ExternalServiceError } from "../../../utils/errors";
import { decodeGoogleIdToken } from "../../../utils/decode.google.id.token";
import AuthProvider from "../../../enums/auth.provider";
import { randomInt, randomUUID } from "crypto";
import hashPassword from "../../../utils/hash.password";
@injectable()
class V1UserRepository implements IUserRepository {
  login(email: string, password: string): Promise<DataOrError<AuthResponse>>;
  login(googleIdToken: string): Promise<DataOrError<AuthResponse>>;

  async login(emailOrIdToken: string, password?: string): Promise<DataOrError<AuthResponse>> {
    if (!password) {
      return this.googleLogin(emailOrIdToken);
    }
    return this.defaultLogin(emailOrIdToken, password);
  }

  private async googleLogin(idToken: string): Promise<DataOrError<AuthResponse>> {
    try {
      const decodedToken = await decodeGoogleIdToken(idToken);
      const { data: userInfo, error } = decodedToken;
      if (error) {
        return { data: null, error };
      }
      const {
        email,
        picture: avatar,
        username,
        googleId
      } = userInfo!;

      // check if user exists, also update their profile photo during login if changed
      const userRecord = await User.findOne({ providerId: googleId });

      // if user already exists just issue tokens
      if (userRecord) {
        const accessToken = createAccessToken(userRecord._id.toString());
        const refreshToken = createRefreshToken(userRecord._id.toString());
        return {
          data: {
            accessToken,
            refreshToken
          },
          error: null
        };
      }

      // create a server generated password to fullfill db constraints
      const generatedPassword = (await hashPassword(randomUUID())).slice(0, 19);
      const usernameLength = username.length;

      // pad username to fit 8 digits
      const paddedUsername = usernameLength < 8 ? `${username}${randomUUID()}`.slice(0, 10) : username;

      // otherwise create the user and then return tokens
      const newUserRecord = await User.insertOne({
        provider: AuthProvider.google,
        providerId: googleId,
        email,
        username: paddedUsername,
        avatar,
        password: generatedPassword,
      });

      const accessToken = createAccessToken(newUserRecord._id.toString());
      const refreshToken = createRefreshToken(newUserRecord._id.toString());
      return {
        data: {
          accessToken,
          refreshToken
        },
        error: null
      }

    } catch (error) {
      logger.error(error);
      return {
        error: error as Error,
        data: null
      }
    }
  };
  private async defaultLogin(email: string, password: string): Promise<DataOrError<AuthResponse>> {
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
          error: new TokenValidationError("Incorrect password"),
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
  };


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
            error: new TokenValidationError("Email already exists"),
            data: null,
          };
        }
        if (existingUser.username === username) {
          return {
            error: new TokenValidationError("Username already exists"),
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
        error: new TokenValidationError(
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
        unique_filename: true,
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
              logger.error(error, "Error uploading avatar");
              return reject(error);
            } else {
              if (!result) {
                logger.error("No result returned from upload");
                return reject(
                  new Error("No result returned from upload")
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

  async getUserDetails(userId: string): Promise<DataOrError<UserDetails>> {
    try {
      const user = await User.findById(userId, "username email avatar createdAt").exec();
      if (!user) {
        return {
          data: null,
          error: new NotFoundError("User not found"),
        };
      }
      const { username, email, avatar: avatarUrl, createdAt } = user;
      return {
        data: {
          username,
          email,
          avatarUrl,
          createdAt: createdAt.toISOString()
        },
        error: null,
      };
    } catch (error) {
      logger.error(error, "Error fetching user details");
      return {
        data: null,
        error: new DatabaseError(`Failed to get user details: ${(error as Error).message}`),
      };
    }
  }
}

export default V1UserRepository;
