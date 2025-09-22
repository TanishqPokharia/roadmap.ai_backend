import { NextFunction, Request, Response } from "express";

export default interface IPostController {
  getPopularPosts(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPostsByTitle(req: Request, res: Response, next: NextFunction): Promise<void>;
  uploadPost(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPostsByTime(req: Request, res: Response, next: NextFunction): Promise<void>;
  togglePostLike(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPostsByAuthor(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPostedRoadmap(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUserPostsMetaData(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUserPostRoadmap(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUserPostStats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
