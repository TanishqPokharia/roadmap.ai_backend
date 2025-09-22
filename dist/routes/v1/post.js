"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const check_token_1 = __importDefault(require("../../middlewares/check.token"));
const tsyringe_1 = require("tsyringe");
const multer_1 = __importDefault(require("multer"));
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
const controller = tsyringe_1.container.resolve("PostController");
router.get("/", controller.getPopularPosts);
router.get("/stats", check_token_1.default, controller.getUserPostStats);
router.get("/time", controller.getPostsByTime);
router.get("/search", controller.getPostsByTitle);
router.get("/user", check_token_1.default, controller.getUserPostsMetaData);
router.get("/user/:postId", check_token_1.default, controller.getUserPostRoadmap);
router.get("/roadmap/:postId", check_token_1.default, controller.getPostedRoadmap);
router.get("/:authorId", controller.getPostsByAuthor);
router.patch("/like/:postId", check_token_1.default, controller.togglePostLike);
router.post("/", check_token_1.default, uploader.single("bannerImage"), controller.uploadPost);
exports.default = router;
