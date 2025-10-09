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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsyringe_1 = require("tsyringe");
const v4_1 = require("zod/v4");
const logger_1 = require("../../../utils/logger");
const errors_1 = require("../../../utils/errors");
let V1UserController = class V1UserController {
    constructor(repo) {
        this.repo = repo;
        this.logout = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            res.clearCookie("tokens", { httpOnly: true, sameSite: "none", signed: true, path: "/", secure: true }).status(200).json({ message: "User logged out successfully" });
        });
        this.validateCookie = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.token;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            res.status(200).json({ message: 'Validated' });
        });
        this.signUp = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
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
            const { data: tokens, error } = yield this.repo.signUp(validated.username, validated.email, validated.password);
            if (error) {
                next(error);
                return;
            }
            const { accessToken, refreshToken } = tokens;
            if (((_a = req.useragent) === null || _a === void 0 ? void 0 : _a.isAndroid) || ((_b = req.useragent) === null || _b === void 0 ? void 0 : _b.isiPhone) || ((_c = req.useragent) === null || _c === void 0 ? void 0 : _c.isiPad) || ((_d = req.useragent) === null || _d === void 0 ? void 0 : _d.isMobile)) {
                res.status(201).json({ accessToken, refreshToken });
            }
            else {
                res.status(201).cookie("tokens", { accessToken, refreshToken }, { httpOnly: true, sameSite: "none", signed: true, path: "/", secure: true }).json({ message: "User registered successfully" });
            }
        });
        this.login = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
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
            const { data: tokens, error } = yield this.repo.login(validated.email, validated.password);
            if (error) {
                next(error);
                return;
            }
            const { accessToken, refreshToken } = tokens;
            if (((_a = req.useragent) === null || _a === void 0 ? void 0 : _a.isAndroid) || ((_b = req.useragent) === null || _b === void 0 ? void 0 : _b.isiPhone) || ((_c = req.useragent) === null || _c === void 0 ? void 0 : _c.isiPad) || ((_d = req.useragent) === null || _d === void 0 ? void 0 : _d.isMobile)) {
                res.status(200).json({ accessToken, refreshToken });
            }
            else {
                res.status(200).cookie("tokens", { accessToken, refreshToken }, { httpOnly: true, sameSite: "none", signed: true, path: "/", secure: true }).json({ message: "User logged in successfully" });
            }
        });
        this.refresh = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            if (!req.body) {
                next(new errors_1.ValidationError("Request body is required"));
                return;
            }
            let refreshToken;
            if (((_a = req.useragent) === null || _a === void 0 ? void 0 : _a.isAndroid) || ((_b = req.useragent) === null || _b === void 0 ? void 0 : _b.isiPhone) || ((_c = req.useragent) === null || _c === void 0 ? void 0 : _c.isiPad) || ((_d = req.useragent) === null || _d === void 0 ? void 0 : _d.isMobile)) {
                refreshToken = req.body.refreshToken;
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
            const { data: tokens, error } = yield this.repo.refresh(validated.refreshToken);
            if (error) {
                next(error);
                return;
            }
            const { accessToken, refreshToken: newRefreshToken } = tokens;
            if (((_e = req.useragent) === null || _e === void 0 ? void 0 : _e.isAndroid) || ((_f = req.useragent) === null || _f === void 0 ? void 0 : _f.isiPhone) || ((_g = req.useragent) === null || _g === void 0 ? void 0 : _g.isiPad) || ((_h = req.useragent) === null || _h === void 0 ? void 0 : _h.isMobile)) {
                res.status(200).json({ accessToken, refreshToken: newRefreshToken });
            }
            else {
                res.status(200).cookie("tokens", { accessToken, refreshToken: newRefreshToken }, { httpOnly: true, sameSite: "none", signed: true, path: "/", secure: true }).json({ message: "Token refreshed successfully" });
            }
        });
        this.uploadAvatar = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
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
            const { data, error } = yield this.repo.uploadAvatar(userId.toString(), avatar);
            if (error) {
                next(error);
                return;
            }
            res.status(200).json({ avatar: data });
        });
        this.getUserDetails = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.token;
            const { data, error } = yield this.repo.getUserDetails(userId.toString());
            if (error) {
                next(error);
                return;
            }
            res.status(200).json(data);
        });
    }
};
V1UserController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("UserRepository")),
    __metadata("design:paramtypes", [Object])
], V1UserController);
exports.default = V1UserController;
