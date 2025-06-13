import { Request, Response } from "express";

export default interface IRoadmapController {
  generateRoadmap(req: Request, res: Response): Promise<void>;
  saveRoadmap(req: Request, res: Response): Promise<void>;
  deleteRoadmap(req: Request, res: Response): Promise<void>;
  getPrivateRoadmaps(req: Request, res: Response): Promise<void>;
  setRoadmapSubgoalStatus(req: Request, res: Response): Promise<void>;
}
