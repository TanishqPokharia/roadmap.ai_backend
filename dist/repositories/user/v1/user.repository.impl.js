var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary, } from "cloudinary";
import { NotFoundError, ValidationError as TokenValidationError, DatabaseError, ExternalServiceError } from "../../../utils/errors.js";
import { injectable } from "tsyringe";
import { decodeGoogleIdToken } from "../../../utils/decode.google.id.token.js";
import User from "../../../schemas/user.js";
import createAccessToken from "../../../utils/create.access.token.js";
import createRefreshToken from "../../../utils/create.refresh.token.js";
import hashPassword from "../../../utils/hash.password.js";
import { randomUUID } from "crypto";
import AuthProvider from "../../../enums/auth.provider.js";
import { logger } from "../../../utils/logger.js";
let V1UserRepository = class V1UserRepository {
    async login(emailOrIdToken, password) {
        if (!password) {
            return this.googleLogin(emailOrIdToken);
        }
        return this.defaultLogin(emailOrIdToken, password);
    }
    async googleLogin(idToken) {
        try {
            const decodedToken = await decodeGoogleIdToken(idToken);
            const { data: userInfo, error } = decodedToken;
            if (error) {
                return { data: null, error };
            }
            const { email, picture: avatar, username, googleId } = userInfo;
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
            };
        }
        catch (error) {
            logger.error(error);
            return {
                error: error,
                data: null
            };
        }
    }
    ;
    async defaultLogin(email, password) {
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
        }
        catch (error) {
            logger.error(error, "Error during login");
            return {
                data: null,
                error: new DatabaseError(`Login failed: ${error.message}`),
            };
        }
    }
    ;
    async signUp(username, email, password) {
        try {
            // search if email already registered
            const existingUser = await User.findOne({
                $or: [{ email }, { username }],
            }, "email username").exec();
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
        }
        catch (error) {
            logger.error(error, "Error during signup");
            return {
                error: new DatabaseError(`Failed to create user: ${error.message}`),
                data: null,
            };
        }
    }
    async refresh(refreshToken) {
        try {
            const secret = process.env.REFRESH_TOKEN_SECRET;
            const decoded = jwt.verify(refreshToken, secret);
            const accessToken = createAccessToken(decoded.userId);
            const newRefreshToken = createRefreshToken(decoded.userId);
            return {
                data: {
                    accessToken,
                    refreshToken: newRefreshToken,
                },
                error: null,
            };
        }
        catch (error) {
            logger.error(error, "Error refreshing token");
            return {
                data: null,
                error: new TokenValidationError(`Invalid refresh token: ${error.message}`),
            };
        }
    }
    async uploadAvatar(userId, avatar) {
        try {
            const options = {
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
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream(options, (error, result) => {
                    if (error) {
                        logger.error(error, "Error uploading avatar");
                        return reject(error);
                    }
                    else {
                        if (!result) {
                            logger.error("No result returned from upload");
                            return reject(new Error("No result returned from upload"));
                        }
                        return resolve(result);
                    }
                })
                    .end(avatar);
            });
            await User.findByIdAndUpdate(userId, { avatar: result.secure_url }, { new: true, fields: "avatar", upsert: true }).exec();
            return {
                data: result.secure_url,
                error: null,
            };
        }
        catch (error) {
            logger.error(error, "Error uploading avatar");
            return {
                data: null,
                error: new ExternalServiceError("Failed to update avatar: " + error.message),
            };
        }
    }
    async getUserDetails(userId) {
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
        }
        catch (error) {
            logger.error(error, "Error fetching user details");
            return {
                data: null,
                error: new DatabaseError(`Failed to get user details: ${error.message}`),
            };
        }
    }
};
V1UserRepository = __decorate([
    injectable()
], V1UserRepository);
export default V1UserRepository;
