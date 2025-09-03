import { Router } from "express";
import roadmapRouter from "./roadmap";
import postRouter from "./post";
import userRouter from "./user";
import checkToken from "../../middlewares/check.token";
import errorHandler from "../../middlewares/error.handler";
const router = Router();

router.use("/roadmap", checkToken, roadmapRouter);
router.use("/post", checkToken, postRouter);
router.use("/user", userRouter);
export default router;
