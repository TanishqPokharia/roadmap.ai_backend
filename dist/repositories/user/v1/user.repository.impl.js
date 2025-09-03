"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const user_1 = __importDefault(require("../../../schemas/user"));
const create_access_token_1 = __importDefault(require("../../../utils/create.access.token"));
const create_refresh_toke_1 = __importDefault(require("../../../utils/create.refresh.toke"));
const tsyringe_1 = require("tsyringe");
const logger_1 = require("../../../utils/logger");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cloudinary_1 = require("cloudinary");
const errors_1 = require("../../../utils/errors");
let V1UserRepository = class V1UserRepository {
    signUp(username, email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // search if email already registered
                const existingUser = yield user_1.default.findOne({
                    $or: [{ email }, { username }],
                }, "email username").exec();
                if (existingUser) {
                    if (existingUser.email === email) {
                        return {
                            error: new errors_1.ValidationError("Email already exists"),
                            data: null,
                        };
                    }
                    if (existingUser.username === username) {
                        return {
                            error: new errors_1.ValidationError("Username already exists"),
                            data: null,
                        };
                    }
                }
                // sign up the user and return the tokens
                const user = new user_1.default({
                    username,
                    email,
                    password,
                });
                const savedUser = yield user.save();
                const accessToken = (0, create_access_token_1.default)(savedUser._id.toString());
                const refreshToken = (0, create_refresh_toke_1.default)(savedUser._id.toString());
                return {
                    error: null,
                    data: {
                        accessToken,
                        refreshToken,
                    },
                };
            }
            catch (error) {
                logger_1.logger.error(error, "Error during signup");
                return {
                    error: new errors_1.DatabaseError(`Failed to create user: ${error.message}`),
                    data: null,
                };
            }
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_1.default.findOne({ email }, "_id email password").exec();
                if (!user) {
                    return {
                        data: null,
                        error: new errors_1.NotFoundError("User not found"),
                    };
                }
                const isCorrectPassword = yield bcrypt_1.default.compare(password, user.password);
                if (!isCorrectPassword) {
                    return {
                        data: null,
                        error: new errors_1.ValidationError("Incorrect password"),
                    };
                }
                const accessToken = (0, create_access_token_1.default)(user._id.toString());
                const refreshToken = (0, create_refresh_toke_1.default)(user._id.toString());
                return {
                    data: {
                        accessToken,
                        refreshToken,
                    },
                    error: null,
                };
            }
            catch (error) {
                logger_1.logger.error(error, "Error during login");
                return {
                    data: null,
                    error: new errors_1.DatabaseError(`Login failed: ${error.message}`),
                };
            }
        });
    }
    refresh(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const secret = process.env.REFRESH_TOKEN_SECRET;
                const decoded = jsonwebtoken_1.default.verify(refreshToken, secret);
                const accessToken = (0, create_access_token_1.default)(decoded.userId);
                const newRefreshToken = (0, create_refresh_toke_1.default)(decoded.userId);
                return {
                    data: {
                        accessToken,
                        refreshToken: newRefreshToken,
                    },
                    error: null,
                };
            }
            catch (error) {
                logger_1.logger.error(error, "Error refreshing token");
                return {
                    data: null,
                    error: new errors_1.ValidationError(`Invalid refresh token: ${error.message}`),
                };
            }
        });
    }
    uploadAvatar(userId, avatar) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const options = {
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
                const result = yield new Promise((resolve, reject) => {
                    cloudinary_1.v2.uploader
                        .upload_stream(options, (error, result) => {
                        if (error) {
                            logger_1.logger.error(error, "Error uploading avatar to Cloudinary");
                            return reject(error);
                        }
                        else {
                            if (!result) {
                                logger_1.logger.error("No result returned from Cloudinary upload");
                                return reject(new Error("No result returned from Cloudinary upload"));
                            }
                            return resolve(result);
                        }
                    })
                        .end(avatar);
                });
                yield user_1.default.findByIdAndUpdate(userId, { avatar: result.secure_url }, { new: true, fields: "avatar", upsert: true }).exec();
                return {
                    data: result.secure_url,
                    error: null,
                };
            }
            catch (error) {
                logger_1.logger.error(error, "Error uploading avatar");
                return {
                    data: null,
                    error: new errors_1.ExternalServiceError("Failed to update avatar: " + error.message),
                };
            }
        });
    }
    getUserDetails(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_1.default.findById(userId, "username email avatar").exec();
                if (!user) {
                    return {
                        data: null,
                        error: new errors_1.NotFoundError("User not found"),
                    };
                }
                return {
                    data: {
                        username: user.username,
                        email: user.email,
                        avatarUrl: user.avatar,
                    },
                    error: null,
                };
            }
            catch (error) {
                logger_1.logger.error(error, "Error fetching user details");
                return {
                    data: null,
                    error: new errors_1.DatabaseError(`Failed to get user details: ${error.message}`),
                };
            }
        });
    }
};
V1UserRepository = __decorate([
    (0, tsyringe_1.injectable)()
], V1UserRepository);
exports.default = V1UserRepository;
