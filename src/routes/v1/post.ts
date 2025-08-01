import { Router } from "express";
import checkToken from "../../middlewares/check.token";
import { container } from "tsyringe";
import IPostController from "../../controllers/post/post.controller.interface";

const router = Router();

const controller: IPostController = container.resolve("PostController");

router.get("/", controller.getPopularPosts);
router.get("/time", controller.getPostsByTime);
router.get("/search", controller.getPostsByTitle);
router.get("/:authorId", controller.getPostsByAuthor);
router.patch("/like/:postId", controller.togglePostLike);
router.post("/", controller.uploadPost);

export default router;
