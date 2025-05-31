import { Request, Response } from "express";
import { RoadmapController } from "../interface";
import { inject, injectable } from "tsyringe";
import { RoadmapRepository } from "../../../repositories/roadmap/interface";
import logger from "../../../utils/logger";

@injectable()
class V1RoadmapController implements RoadmapController {
  constructor(@inject("RoadmapRepository") private repo: RoadmapRepository) {}
  generateRoadmap = async (req: Request, res: Response): Promise<void> => {
    logger.info("Generating roadmap...");
    const { topic } = req.query;
    if (typeof topic !== "string" || topic.trim() === "") {
      res
        .status(400)
        .json({ error: "Topic is required and must be a non-empty string." });
      return;
    }
    const { data: roadmap, error } = await this.repo.generateRoadmap(topic);

    if (error) {
      res.status(500).json({ error: "Failed to generate roadmap." });
      return;
    }

    res.status(200).json({ roadmap });
  };
}

export default V1RoadmapController;
