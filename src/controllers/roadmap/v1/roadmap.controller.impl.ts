import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { logger } from "../../../utils/logger";
import IRoadmapController from "../roadmap.controller.interface";
import IRoadmapRepository from "../../../repositories/roadmap/roadmap.repository.interface";
import { z } from "zod/v4";
import { ValidationError } from "../../../utils/errors";

@injectable()
class V1RoadmapController implements IRoadmapController {
  constructor(@inject("RoadmapRepository") private repo: IRoadmapRepository) { }
  saveRoadmap = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.token;
    const { roadmap } = req.body;

    const saveRoadmapSchema = z.object({
      userId: z.string().min(1, "User ID is required."),
      roadmap: z.object({
        title: z.string().min(1, "Roadmap title is required").max(100),
        description: z.string().min(10, "Description is required").max(400),
        goals: z.array(z.any()).min(1, "Roadmap must have at least one goal"),
      }),
    });
    const validatedRoadmap = saveRoadmapSchema.safeParse({
      userId,
      roadmap,
    });
    if (!validatedRoadmap.success) {
      // use next function instead
      next(new ValidationError(z.prettifyError(validatedRoadmap.error)));
      return;
    }
    const validated = validatedRoadmap.data;

    const { data: message, error } = await this.repo.saveRoadmap(
      validated.userId,
      roadmap
    );

    if (error) {
      next(error);
      return;
    }

    res.status(201).json({ message });
  };

  deleteRoadmap = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { roadmapId } = req.params;

    const { data, error } = await this.repo.deleteRoadmap(roadmapId);
    if (error) {
      next(error);
      return;
    }
    res.status(200).json({ message: "Roadmap deleted successfully." });
  };
  getPrivateRoadmapsMetaData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.token;
    const { limit, skip } = req.query;

    const getRoadmapsMetaDataSchema = z.object({
      userId: z.string().nonempty("User ID is required."),
      limit: z.preprocess((val) => Number(val), z.int().nonnegative().optional()),
      skip: z.preprocess((val) => Number(val), z.int().nonnegative().optional()),
    });
    const validateInputs = getRoadmapsMetaDataSchema.safeParse({
      userId,
      limit,
      skip,
    });
    if (!validateInputs.success) {
      next(new ValidationError(z.prettifyError(validateInputs.error)));
      return;
    }

    const validated = validateInputs.data;
    const { data: roadmaps, error } = await this.repo.getPrivateRoadmapsMetaData(
      validated.userId,
      validated.limit ?? 10,
      validated.skip ?? 0
    );

    if (error) {
      next(error);
      return;
    }

    res.status(200).json({ roadmaps });
  };

  getPrivateRoadmap = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.token;
    const roadmapId = req.params.roadmapId;
    const getPrivateRoadmapSchema = z.object({
      userId: z.string().nonempty("User Id is required"),
      roadmapId: z.string().nonempty("Roadmap Id is required")
    }).required();

    const validateInputs = getPrivateRoadmapSchema.safeParse({
      userId,
      roadmapId
    });

    if (!validateInputs.success) {
      next(new ValidationError(z.prettifyError(validateInputs.error)));
      return;
    }

    const validatedData = validateInputs.data;
    const { data: roadmap, error } = await this.repo.getPrivateRoadmap(validatedData.userId, validatedData.roadmapId);

    if (error) {
      next(error);
      return;
    }

    res.status(200).json({ roadmap });
  }


  setRoadmapSubgoalStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { roadmapId, subgoalId, goalId } = req.params;

    if (!req.body) {
      next(new ValidationError("Request body is required."));
      return;
    }

    const { status } = req.body;
    const setStatusSchema = z.object({
      status: z.boolean().nonoptional("Status is required"),
      roadmapId: z.string().min(1, "Roadmap ID is required"),
      subgoalId: z.string().min(1, "Subgoal ID is required"),
    });

    const validatedStatus = setStatusSchema.safeParse({
      status,
      roadmapId,
      subgoalId,
    });

    if (!validatedStatus.success) {
      next(new ValidationError(z.prettifyError(validatedStatus.error)));
      return;
    }

    const { data: message, error } = await this.repo.setRoadmapSubgoalStatus(
      roadmapId,
      goalId,
      subgoalId,
      status
    );

    if (error) {
      next(error);
      return;
    }

    res.status(200).json({ message });
  };
  generateRoadmap = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    logger.info("Generating roadmap...");
    const { topic } = req.query;
    if (typeof topic !== "string" || topic.trim() === "") {
      next(new ValidationError("Topic is required and must be a non-empty string."));
      return;
    }

    const { data: roadmap, error } = await this.repo.generateRoadmap(topic);

    if (error) {
      next(error);
      return;
    }

    res.status(200).json(roadmap);
  };
}

export default V1RoadmapController;
