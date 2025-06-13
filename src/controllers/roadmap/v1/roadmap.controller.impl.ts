import { Response } from "express";
import { inject, injectable } from "tsyringe";

import logger from "../../../utils/logger";
import IRoadmapController from "../roadmap.controller.interface";
import IRoadmapRepository from "../../../repositories/roadmap/roadmap.repository.interface";
import { z } from "zod/v4";
import AuthenticatedRequest from "../../../models/authenticated.request";

@injectable()
class V1RoadmapController implements IRoadmapController {
  constructor(@inject("RoadmapRepository") private repo: IRoadmapRepository) {}
  saveRoadmap = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.token;
    const { roadmap } = req.body;

    const saveRoadmapSchema = z.object({
      userId: z.string().min(1, "User ID is required."),
      roadmap: z.object({
        id: z.string().min(1, "Roadmap ID is required"),
        title: z.string().min(1, "Roadmap title is required").max(100),
        goals: z.array(z.any()).min(1, "Roadmap must have at least one goal"),
      }),
    });
    const validatedRoadmap = saveRoadmapSchema.safeParse({
      userId,
      roadmap,
    });
    if (!validatedRoadmap.success) {
      res.status(400).json({ error: z.prettifyError(validatedRoadmap.error) });
      return;
    }
    const validated = validatedRoadmap.data;

    const savedRoadmap = await this.repo.saveRoadmap(validated.userId, roadmap);
    if (savedRoadmap.error) {
      logger.error("Error saving roadmap:", savedRoadmap.error);
      res.status(500).json({ error: savedRoadmap.error });
      return;
    }

    res.status(200).json({ message: "Roadmap saved successfully." });
  };

  deleteRoadmap = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const { roadmapId } = req.params;
    const deleteRoadmapSchema = z.object({
      roadmap: z.object({
        id: z.string().min(1, "Roadmap ID is required"),
        title: z.string().min(1, "Roadmap title is required").max(100),
        goals: z.array(z.any()).min(1, "Roadmap must have at least one goal"),
      }),
    });

    const validatedRoadmap = deleteRoadmapSchema.safeParse({
      roadmap: { id: roadmapId },
    });
    if (!validatedRoadmap.success) {
      res.status(400).json({ error: z.prettifyError(validatedRoadmap.error) });
      return;
    }

    const deletedRoadmap = await this.repo.deleteRoadmap(roadmapId);
    if (deletedRoadmap.error) {
      logger.error("Error deleting roadmap:", deletedRoadmap.error);
      res.status(500).json({ error: deletedRoadmap.error });
      return;
    }
    res.status(200).json({ message: "Roadmap deleted successfully." });
  };
  getPrivateRoadmaps = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.token;
    const { limit, skip } = req.query;

    const getRoadmapsSchema = z.object({
      userId: z.string().min(1, "User ID is required."),
      limit: z.number().optional(),
      skip: z.number().optional(),
    });
    const validatedRoadmaps = getRoadmapsSchema.safeParse({
      userId,
      limit,
      skip,
    });
    if (!validatedRoadmaps.success) {
      res.status(400).json({ error: z.prettifyError(validatedRoadmaps.error) });
      return;
    }

    const validated = validatedRoadmaps.data;
    const { data: roadmaps, error } = await this.repo.getPrivateRoadmaps(
      validated.userId,
      validated.limit ?? 10,
      validated.skip ?? 0
    );
    if (error) {
      logger.error("Error fetching private roadmaps:", error);
      res.status(500).json({ error: "Failed to fetch private roadmaps." });
      return;
    }
    res.status(200).json({ roadmaps });
  };
  setRoadmapSubgoalStatus = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const { roadmapId, subgoalId, goalId } = req.params;
    const { status } = req.body;

    const setStatusSchema = z.object({
      status: z.boolean(),
      roadmapId: z.string().min(1, "Roadmap ID is required"),
      subgoalId: z.string().min(1, "Subgoal ID is required"),
    });

    const validatedStatus = setStatusSchema.safeParse({
      status,
      roadmapId,
      subgoalId,
    });

    if (!validatedStatus.success) {
      res.status(400).json({ error: z.prettifyError(validatedStatus.error) });
      res.status(400).json({ error: "Invalid parameters or status." });
      return;
    }

    const result = await this.repo.setRoadmapSubgoalStatus(
      roadmapId,
      goalId,
      subgoalId,
      status
    );
    if (result.error) {
      logger.error("Error setting subgoal status:", result.error);
      res.status(500).json({ error: "Failed to set subgoal status." });
      return;
    }
    res.status(200).json({ message: "Subgoal status updated successfully." });
  };
  generateRoadmap = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
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

    res.status(200).json(roadmap);
  };
}

export default V1RoadmapController;
