import { NextFunction, Request, Response } from "express";
import IUserController from "../user.controller.interface";
import IUserRepository from "../../../repositories/user/user.repository.interface";
import { inject, injectable } from "tsyringe";
import { file, z } from "zod/v4";
import { logger } from "../../../utils/logger";
import { ValidationError } from "../../../utils/errors";

@injectable()
class V1UserController implements IUserController {
  constructor(@inject("UserRepository") private repo: IUserRepository) { }
  signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username, email, password } = req.body;
    const signUpScehma = z.object({
      username: z.string().min(8, "Username is required").max(20),
      email: z.email("Invalid email format"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long"),
    });
    const validation = signUpScehma.safeParse({
      username,
      email,
      password,
    });

    if (!validation.success) {
      throw new ValidationError(z.prettifyError(validation.error));
    }

    const validated = validation.data;

    const { data: tokens, error } = await this.repo.signUp(
      validated.username,
      validated.email,
      validated.password
    );
    if (error) {
      next(error);
      return;
    }
    const { accessToken, refreshToken } = tokens!;

    res.status(201).json({ accessToken, refreshToken });
  };
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;
    const loginSchema = z.object({
      email: z.email("Invalid email format"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long"),
    });
    const validation = loginSchema.safeParse({
      email,
      password,
    });
    if (!validation.success) {
      throw new ValidationError(z.prettifyError(validation.error));
    }
    const validated = validation.data;

    const { data: tokens, error } = await this.repo.login(
      validated.email,
      validated.password
    );
    if (error) {
      next(error);
      return;
    }
    const { accessToken, refreshToken } = tokens!;

    res.status(200).json({ accessToken, refreshToken });
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.body) {
      throw new ValidationError("Request body is required");
    }

    const { refreshToken } = req.body;
    const refreshSchema = z.object({
      refreshToken: z.string().min(1, "Refresh token is required"),
    });
    const validation = refreshSchema.safeParse({ refreshToken });

    if (!validation.success) {
      throw new ValidationError(z.prettifyError(validation.error));
    }

    const validated = validation.data;

    const { data: tokens, error } = await this.repo.refresh(
      validated.refreshToken
    );
    if (error) {
      next(error);
      return;
    }
    const { accessToken, refreshToken: newRefreshToken } = tokens!;

    res.status(200).json({ accessToken, refreshToken: newRefreshToken });
  };

  uploadAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.token;
    if (!req.file) {
      throw new ValidationError("Avatar file is required");
    }

    logger.info("File:" + req.file.originalname);

    const avatar = req.file.buffer;

    if (!avatar) {
      throw new ValidationError("Could not process avatar file path");
    }

    logger.info("AVATAR : " + avatar);

    const { data, error } = await this.repo.uploadAvatar(
      userId.toString(),
      avatar
    );
    if (error) {
      next(error);
      return;
    }
    res.status(200).json({ avatar: data });
  };
}

export default V1UserController;
