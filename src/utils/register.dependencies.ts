import { container } from "tsyringe";
import V1RoadmapRepository from "../repositories/roadmap/v1/roadmap.repository.impl";
import V1RoadmapController from "../controllers/roadmap/v1/roadmap.controller.impl";
import IRoadmapRepository from "../repositories/roadmap/roadmap.repository.interface";
import IRoadmapController from "../controllers/roadmap/roadmap.controller.interface";
import IPostRepository from "../repositories/post/post.repository.interface";
import V1PostRepository from "../repositories/post/v1/post.repository.impl";
import IUserRepository from "../repositories/user/user.repository.interface";
import V1UserRepository from "../repositories/user/v1/user.repository.impl";
import V1PostController from "../controllers/post/v1/post.controller.impl";
import IPostController from "../controllers/post/post.controller.interface";
import V1UserController from "../controllers/user/v1/user.controller.impl";
import IUserController from "../controllers/user/user.controller.interface";

export const registerDependencies = () => {
  // register repositories
  container.registerSingleton<IRoadmapRepository>(
    "RoadmapRepository",
    V1RoadmapRepository
  );
  container.registerSingleton<IPostRepository>(
    "PostRepository",
    V1PostRepository
  );
  container.registerSingleton<IUserRepository>(
    "UserRepository",
    V1UserRepository
  );

  // register controllers
  container.registerSingleton<IRoadmapController>(
    "RoadmapController",
    V1RoadmapController
  );
  container.registerSingleton<IPostController>(
    "PostController",
    V1PostController
  );
  container.registerSingleton<IUserController>(
    "UserController",
    V1UserController
  );
};
