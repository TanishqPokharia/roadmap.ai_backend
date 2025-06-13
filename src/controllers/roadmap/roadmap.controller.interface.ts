import { Request, Response } from "express";
import AuthenticatedRequest from "../../models/authenticated.request";

export default interface IRoadmapController {
  generateRoadmap(req: AuthenticatedRequest, res: Response): Promise<void>;
  saveRoadmap(req: AuthenticatedRequest, res: Response): Promise<void>;
  deleteRoadmap(req: AuthenticatedRequest, res: Response): Promise<void>;
  getPrivateRoadmaps(req: AuthenticatedRequest, res: Response): Promise<void>;
  setRoadmapSubgoalStatus(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void>;
}
