import { Request, Response } from "express";
import IUserController from "../user.controller.interface";
import IUserRepository from "../../../repositories/user/user.repository.interface";
import { inject, injectable } from "tsyringe";
import { z } from "zod/v4";

@injectable()
class V1UserController implements IUserController {
  constructor(@inject("UserRepository") private repo: IUserRepository) {}
  signUp = async (req: Request, res: Response): Promise<void> => {
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
      res.status(400).json({ error: z.prettifyError(validation.error) });
      return;
    }

    const validated = validation.data;

    const { data: tokens, error } = await this.repo.signUp(
      validated.username,
      validated.email,
      validated.password
    );
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    const { accessToken, refreshToken } = tokens!;

    res.status(201).json({ accessToken, refreshToken });
  };
  login = async (req: Request, res: Response): Promise<void> => {
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
      res.status(400).json({ error: z.prettifyError(validation.error) });
      return;
    }
    const validated = validation.data;

    const { data: tokens, error } = await this.repo.login(
      validated.email,
      validated.password
    );
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    const { accessToken, refreshToken } = tokens!;

    res.status(200).json({ accessToken, refreshToken });
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    if (!req.body) {
      res.status(400).json({ error: "Request body is required" });
      return;
    }

    const { refreshToken } = req.body;
    const refreshSchema = z.object({
      refreshToken: z.string().min(1, "Refresh token is required"),
    });
    const validation = refreshSchema.safeParse({ refreshToken });

    if (!validation.success) {
      res.status(400).json({ error: z.prettifyError(validation.error) });
      return;
    }

    const validated = validation.data;

    const { data: tokens, error } = await this.repo.refresh(
      validated.refreshToken
    );
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    const { accessToken, refreshToken: newRefreshToken } = tokens!;

    res.status(200).json({ accessToken, refreshToken: newRefreshToken });
  };
}

export default V1UserController;
