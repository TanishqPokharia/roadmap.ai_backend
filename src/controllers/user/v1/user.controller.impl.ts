import { CookieOptions, NextFunction, Request, Response } from "express";
import IUserController from "../user.controller.interface";
import IUserRepository from "../../../repositories/user/user.repository.interface";
import { inject, injectable } from "tsyringe";
import { z } from "zod/v4";
import { logger } from "../../../utils/logger";
import { ValidationError } from "../../../utils/errors";

@injectable()
class V1UserController implements IUserController {
  constructor(@inject("UserRepository") private repo: IUserRepository) { }
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const isProduction = process.env.NODE_ENV === "prod";
    const cookieOptions:CookieOptions = {
      httpOnly: true,
      signed: true,
      path: "/",
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      ...(isProduction && { partitioned: true })
    };
    res.clearCookie("tokens", cookieOptions).status(200).json({ message: "User logged out successfully" });
  }
  validateCookie = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.token;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    res.status(200).json({ message: 'Validated' });
  }
  signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username, email, password } = req.body;
    const signUpScehma = z.object({
      username: z.string().min(8, "Min. 8 length username is required").max(20),
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
      next(new ValidationError(z.prettifyError(validation.error)));
      return;
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

    if (req.useragent?.isAndroid || req.useragent?.isiPhone || req.useragent?.isiPad || req.useragent?.isMobile) {
      res.status(201).json({ accessToken, refreshToken });
    } else {
      const isProduction = process.env.NODE_ENV === "prod";
      const cookieOptions:CookieOptions = {
        httpOnly: true,
        signed: true,
        path: "/",
        sameSite: "none",
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        ...(isProduction && { partitioned: true })
      };
      res.status(201).cookie("tokens", { accessToken, refreshToken }, cookieOptions).json({ message: "User registered successfully" });
    }


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
      next(new ValidationError(z.prettifyError(validation.error)));
      return;
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

    if (req.useragent?.isAndroid || req.useragent?.isiPhone || req.useragent?.isiPad || req.useragent?.isMobile) {
      res.status(200).json({ accessToken, refreshToken });
    } else {
      const isProduction = process.env.NODE_ENV === "prod";
      const cookieOptions:CookieOptions = {
        httpOnly: true,
        signed: true,
        path: "/",
        sameSite: "none",
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        ...(isProduction && { partitioned: true })
      };
      res.status(200).cookie("tokens", { accessToken, refreshToken }, cookieOptions).json({ message: "User logged in successfully" });
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let refreshToken: string;
    if (req.useragent?.isAndroid || req.useragent?.isiPhone || req.useragent?.isiPad || req.useragent?.isMobile) {
      if (!req.body) {
          next(new ValidationError("Request body is required"));
          return;
        }
      refreshToken = req.body.refreshToken;
    } else {
      if (!req.signedCookies || !req.signedCookies.tokens || !req.signedCookies.tokens.refreshToken) {
        next(new ValidationError("Refresh token is required"));
        return;
      }
      refreshToken = req.signedCookies.tokens.refreshToken;
    }


    const refreshSchema = z.object({
      refreshToken: z.string().min(1, "Refresh token is required"),
    });
    const validation = refreshSchema.safeParse({ refreshToken });

    if (!validation.success) {
      next(new ValidationError(z.prettifyError(validation.error)));
      return;
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

    if (req.useragent?.isAndroid || req.useragent?.isiPhone || req.useragent?.isiPad || req.useragent?.isMobile) {
      res.status(200).json({ accessToken, refreshToken: newRefreshToken });
    } else {
      const isProduction = process.env.NODE_ENV === "prod";
      const cookieOptions:CookieOptions = {
        httpOnly: true,
        signed: true,
        path: "/",
        sameSite: "none",
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        ...(isProduction && { partitioned: true })
      };
      res.status(200).cookie("tokens", { accessToken, refreshToken: newRefreshToken }, cookieOptions).json({ message: "Token refreshed successfully" });
    }
  };

  uploadAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.token;
    if (!req.file) {
      next(new ValidationError("Avatar file is required"));
      return;
    }

    logger.info("File:" + req.file.originalname);

    const avatar = req.file.buffer;

    if (!avatar) {
      next(new ValidationError("Could not process avatar file path"));
      return;
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

  getUserDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.token;
    const { data, error } = await this.repo.getUserDetails(userId.toString());
    if (error) {
      next(error);
      return;
    }
    res.status(200).json(data);
  }
}

export default V1UserController;
