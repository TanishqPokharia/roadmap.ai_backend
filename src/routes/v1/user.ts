import { Router } from "express";
import { container } from "tsyringe";
import IUserController from "../../controllers/user/user.controller.interface";

const router = Router();

const controller: IUserController = container.resolve("UserController");
router.post("/signup", controller.signUp);
router.post("/login", controller.login);
router.post("/refresh", controller.refresh);

export default router;
