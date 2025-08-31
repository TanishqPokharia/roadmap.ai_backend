import { NextFunction, Request, Response } from "express";

export default interface IPostController {
  getPopularPosts(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPostsByTitle(req: Request, res: Response, next: NextFunction): Promise<void>;
  uploadPost(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPostsByTime(req: Request, res: Response, next: NextFunction): Promise<void>;
  togglePostLike(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPostsByAuthor(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPostRoadmap(req: Request, res: Response, next: NextFunction): Promise<void>;
}
