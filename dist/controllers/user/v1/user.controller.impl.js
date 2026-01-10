"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsyringe_1 = require("tsyringe");
const v4_1 = require("zod/v4");
const logger_1 = require("../../../utils/logger");
const errors_1 = require("../../../utils/errors");
let V1UserController = class V1UserController {
    constructor(repo) {
        this.repo = repo;
        this.logout = async (req, res, next) => {
            const isProduction = process.env.NODE_ENV === "prod";
            const cookieOptions = Object.assign({ httpOnly: true, signed: true, path: "/", sameSite: "none", secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 }, (isProduction && { partitioned: true }));
            res.clearCookie("tokens", cookieOptions).status(200).json({ message: "User logged out successfully" });
        };
        this.validateCookie = async (req, res, next) => {
            const userId = req.token;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            res.status(200).json({ message: 'Validated' });
        };
        this.signUp = async (req, res, next) => {
            const { username, email, password } = req.body;
            const signUpScehma = v4_1.z.object({
                username: v4_1.z.string().min(8, "Min. 8 length username is required").max(20),
                email: v4_1.z.email("Invalid email format"),
                password: v4_1.z
                    .string()
                    .min(8, "Password must be at least 8 characters long"),
            });
            const validation = signUpScehma.safeParse({
                username,
                email,
                password,
            });
            if (!validation.success) {
                next(new errors_1.ValidationError(v4_1.z.prettifyError(validation.error)));
                return;
            }
            const validated = validation.data;
            const { data: tokens, error } = await this.repo.signUp(validated.username, validated.email, validated.password);
            if (error) {
                next(error);
                return;
            }
            const { accessToken, refreshToken } = tokens;
            if (req.headers['x-client-os'] === 'android') {
                res.status(201).json({ accessToken, refreshToken });
            }
            else {
                const isProduction = process.env.NODE_ENV === "prod";
                const cookieOptions = Object.assign({ httpOnly: true, signed: true, path: "/", sameSite: "none", secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 }, (isProduction && { partitioned: true }));
                res.status(201).cookie("tokens", { accessToken, refreshToken }, cookieOptions).json({ message: "User registered successfully" });
            }
        };
        this.login = async (req, res, next) => {
            const { email, password } = req.body;
            const loginSchema = v4_1.z.object({
                email: v4_1.z.email("Invalid email format"),
                password: v4_1.z
                    .string()
                    .min(8, "Password must be at least 8 characters long"),
            });
            const validation = loginSchema.safeParse({
                email,
                password,
            });
            if (!validation.success) {
                next(new errors_1.ValidationError(v4_1.z.prettifyError(validation.error)));
                return;
            }
            const validated = validation.data;
            const { data: tokens, error } = await this.repo.login(validated.email, validated.password);
            if (error) {
                next(error);
                return;
            }
            const { accessToken, refreshToken } = tokens;
            if (req.headers['x-client-os'] === "android") {
                res.status(200).json({ accessToken, refreshToken });
            }
            else {
                const isProduction = process.env.NODE_ENV === "prod";
                const cookieOptions = Object.assign({ httpOnly: true, signed: true, path: "/", sameSite: "none", secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 }, (isProduction && { partitioned: true }));
                res.status(200).cookie("tokens", { accessToken, refreshToken }, cookieOptions).json({ message: "User logged in successfully" });
            }
        };
        this.refresh = async (req, res, next) => {
            let refreshToken;
            if (req.headers['x-client-os'] === "android") {
                if (!req.headers.authorization) {
                    next(new errors_1.ValidationError("Refresh token is required"));
                    return;
                }
                const authHeader = req.headers.authorization.split(" ");
                if (authHeader.length < 2 || authHeader.at(0) !== 'Bearer') {
                    next(new errors_1.ValidationError('Invalid refresh token format'));
                    return;
                }
                refreshToken = authHeader.at(1);
            }
            else {
                if (!req.signedCookies || !req.signedCookies.tokens || !req.signedCookies.tokens.refreshToken) {
                    next(new errors_1.ValidationError("Refresh token is required"));
                    return;
                }
                refreshToken = req.signedCookies.tokens.refreshToken;
            }
            const refreshSchema = v4_1.z.object({
                refreshToken: v4_1.z.string().min(1, "Refresh token is required"),
            });
            const validation = refreshSchema.safeParse({ refreshToken });
            if (!validation.success) {
                next(new errors_1.ValidationError(v4_1.z.prettifyError(validation.error)));
                return;
            }
            const validated = validation.data;
            const { data: tokens, error } = await this.repo.refresh(validated.refreshToken);
            if (error) {
                next(error);
                return;
            }
            const { accessToken, refreshToken: newRefreshToken } = tokens;
            if (req.headers['x-client-os'] === "android") {
                res.status(200).json({ accessToken, refreshToken: newRefreshToken });
            }
            else {
                const isProduction = process.env.NODE_ENV === "prod";
                const cookieOptions = Object.assign({ httpOnly: true, signed: true, path: "/", sameSite: "none", secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 }, (isProduction && { partitioned: true }));
                res.status(200).cookie("tokens", { accessToken, refreshToken: newRefreshToken }, cookieOptions).json({ message: "Token refreshed successfully" });
            }
        };
        this.uploadAvatar = async (req, res, next) => {
            const userId = req.token;
            if (!req.file) {
                next(new errors_1.ValidationError("Avatar file is required"));
                return;
            }
            logger_1.logger.info("File:" + req.file.originalname);
            const avatar = req.file.buffer;
            if (!avatar) {
                next(new errors_1.ValidationError("Could not process avatar file path"));
                return;
            }
            logger_1.logger.info("AVATAR : " + avatar);
            const { data, error } = await this.repo.uploadAvatar(userId.toString(), avatar);
            if (error) {
                next(error);
                return;
            }
            res.status(200).json({ avatar: data });
        };
        this.getUserDetails = async (req, res, next) => {
            const userId = req.token;
            const { data, error } = await this.repo.getUserDetails(userId.toString());
            if (error) {
                next(error);
                return;
            }
            res.status(200).json(data);
        };
    }
};
V1UserController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("UserRepository")),
    __metadata("design:paramtypes", [Object])
], V1UserController);
exports.default = V1UserController;
