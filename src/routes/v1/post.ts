import { Router } from "express";
import checkToken from "../../middlewares/check.token";
import { container } from "tsyringe";
import IPostController from "../../controllers/post/post.controller.interface";

const router = Router();

const controller: IPostController = container.resolve("PostController");

router.get("/", controller.getPopularPosts);
router.get("/time", controller.getPostsByTime);
router.get("/search", controller.getPostsByTitle);
router.get("/user", checkToken, controller.getUserPostsMetaData);
router.get("/user/:postId", checkToken, controller.getUserPostRoadmap);
router.get("/roadmap/:postId", controller.getPostedRoadmap);
router.get("/:authorId", controller.getPostsByAuthor);
router.patch("/like/:postId", checkToken, controller.togglePostLike);
router.post("/", checkToken, controller.uploadPost);

export default router;
