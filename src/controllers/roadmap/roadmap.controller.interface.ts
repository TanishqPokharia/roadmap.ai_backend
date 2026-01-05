import { NextFunction, Request, Response } from "express";

export default interface IRoadmapController {
  generateRoadmap(req: Request, res: Response, next: NextFunction): Promise<void>;
  saveRoadmap(req: Request, res: Response, next: NextFunction): Promise<void>;
  savePostRoadmap(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteRoadmap(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPrivateRoadmapsMetaData(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPrivateRoadmap(req: Request, res: Response, next: NextFunction): Promise<void>;
  setRoadmapSubgoalStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}
