import { Router } from "express";
import checkToken from "../../middlewares/check.token";
import { container } from "tsyringe";
import IPostController from "../../controllers/post/post.controller.interface";
import multer from "multer";

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

router.use(checkToken);
router.get("/", controller.getPopularPosts);
router.get("/stats", controller.getUserPostStats);
router.get("/time", controller.getPostsByTime);
router.get("/title", controller.getPostsByTitle);
router.get("/user", controller.getUserPostsMetaData);
router.get("/user/:postId", controller.getUserPostRoadmap);
router.get("/details/:postId", controller.getPostDetails);
router.get("/:authorId", controller.getPostsByAuthor);
router.patch("/like/:postId", controller.togglePostLike);
router.post("/", uploader.single("bannerImage"), controller.uploadPost);

export default router;
