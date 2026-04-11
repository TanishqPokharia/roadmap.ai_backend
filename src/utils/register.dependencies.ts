import { container } from "tsyringe";
import IRoadmapRepository from "../repositories/roadmap/roadmap.repository.interface.js";
import V1RoadmapRepository from "../repositories/roadmap/v1/roadmap.repository.impl.js";
import IPostRepository from "../repositories/post/post.repository.interface.js";
import IUserRepository from "../repositories/user/user.repository.interface.js";
import V1PostRepository from "../repositories/post/v1/post.repository.impl.js";
import V1UserRepository from "../repositories/user/v1/user.repository.impl.js";
import IRoadmapController from "../controllers/roadmap/roadmap.controller.interface.js";
import V1RoadmapController from "../controllers/roadmap/v1/roadmap.controller.impl.js";
import IPostController from "../controllers/post/post.controller.interface.js";
import V1PostController from "../controllers/post/v1/post.controller.impl.js";
import IUserController from "../controllers/user/user.controller.interface.js";
import V1UserController from "../controllers/user/v1/user.controller.impl.js";


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
