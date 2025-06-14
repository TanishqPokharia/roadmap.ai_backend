import { Request, Response } from "express";

export default interface IUserController {
  signUp(req: Request, res: Response): Promise<void>;
  login(req: Request, res: Response): Promise<void>;
  refresh(req: Request, res: Response): Promise<void>;
}
