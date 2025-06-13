import { Request, Response } from "express";

export default interface IPostController {
  getPopularPosts(req: Request, res: Response): Promise<void>;
  getPostsByTitle(req: Request, res: Response): Promise<void>;
  uploadPost(req: Request, res: Response): Promise<void>;
  getPostsByTime(req: Request, res: Response): Promise<void>;
  togglePostLike(req: Request, res: Response): Promise<void>;
}
