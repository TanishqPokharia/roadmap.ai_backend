import { NextFunction, Request, Response } from "express";

export default interface IUserController {
  signUp(req: Request, res: Response, next: NextFunction): Promise<void>;
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
  refresh(req: Request, res: Response, next: NextFunction): Promise<void>;
  uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void>;
}
