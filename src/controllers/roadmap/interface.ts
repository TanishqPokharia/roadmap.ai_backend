import { Request, Response } from "express";

export interface RoadmapController {
  generateRoadmap(req: Request, res: Response): Promise<void>;
}
