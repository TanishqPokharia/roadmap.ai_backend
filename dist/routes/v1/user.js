"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const multer_1 = __importDefault(require("multer"));
const check_token_1 = __importDefault(require("../../middlewares/check.token"));
const uploader = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            cb(new Error("Only image files are allowed"));
            return;
        }
        cb(null, true);
    },
});
const router = (0, express_1.Router)();
const controller = tsyringe_1.container.resolve("UserController");
router.get("/validate", check_token_1.default, controller.validateCookie);
router.get("/logout", controller.logout);
router.get("/details", check_token_1.default, controller.getUserDetails);
router.post("/signup", controller.signUp);
router.post("/login", controller.login);
router.post("/refresh", controller.refresh);
router.patch("/avatar/update", check_token_1.default, uploader.single("avatar"), controller.uploadAvatar);
exports.default = router;
