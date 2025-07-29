import { Router } from "express";
import { container } from "tsyringe";
import IUserController from "../../controllers/user/user.controller.interface";
import multer from "multer";
import checkToken from "../../middlewares/check.token";

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

const controller: IUserController = container.resolve("UserController");
router.post("/signup", controller.signUp);
router.post("/login", controller.login);
router.post("/refresh", controller.refresh);
router.patch(
  "/avatar/update",
  checkToken,
  uploader.single("avatar"),
  controller.uploadAvatar
);

export default router;
