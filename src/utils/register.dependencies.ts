import { container } from "tsyringe";
import { RoadmapRepository } from "../repositories/roadmap/interface";
import V1RoadmapRepository from "../repositories/roadmap/v1/impl";
import { RoadmapController } from "../controllers/roadmap/interface";
import V1RoadmapController from "../controllers/roadmap/v1/impl";

export const registerDependencies = () => {
  // register repositories
  container.registerSingleton<RoadmapRepository>(
    "RoadmapRepository",
    V1RoadmapRepository
  );

  // register controllers
  container.registerSingleton<RoadmapController>(
    "RoadmapController",
    V1RoadmapController
  );
};
