import { Router } from "express";
import roadmapRouter from "./roadmap.js";
import postRouter from "./post.js";
import userRouter from "./user.js";
const router = Router();
router.use("/roadmap", roadmapRouter);
router.use("/post", postRouter);
router.use("/auth", userRouter);
export default router;
