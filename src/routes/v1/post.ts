import { Router } from "express";
import checkToken from "../../middlewares/check.token";
import { container } from "tsyringe";
import IPostController from "../../controllers/post/post.controller.interface";
import multer from "multer";
import { check } from "zod/v4";

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});

const router = Router();

const controller: IPostController = container.resolve("PostController");

router.get("/", controller.getPopularPosts);
router.get("/stats", checkToken, controller.getUserPostStats);
router.get("/time", controller.getPostsByTime);
router.get("/search", controller.getPostsByTitle);
router.get("/user", checkToken, controller.getUserPostsMetaData);
router.get("/user/:postId", checkToken, controller.getUserPostRoadmap);
router.get("/roadmap/:postId", checkToken, controller.getPostedRoadmap);
router.get("/:authorId", controller.getPostsByAuthor);
router.patch("/like/:postId", checkToken, controller.togglePostLike);
router.post("/", checkToken, uploader.single("bannerImage"), controller.uploadPost);

export default router;
