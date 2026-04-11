import { container } from "tsyringe";
import V1RoadmapRepository from "../repositories/roadmap/v1/roadmap.repository.impl.js";
import V1PostRepository from "../repositories/post/v1/post.repository.impl.js";
import V1UserRepository from "../repositories/user/v1/user.repository.impl.js";
import V1RoadmapController from "../controllers/roadmap/v1/roadmap.controller.impl.js";
import V1PostController from "../controllers/post/v1/post.controller.impl.js";
import V1UserController from "../controllers/user/v1/user.controller.impl.js";
export const registerDependencies = () => {
    // register repositories
    container.registerSingleton("RoadmapRepository", V1RoadmapRepository);
    container.registerSingleton("PostRepository", V1PostRepository);
    container.registerSingleton("UserRepository", V1UserRepository);
    // register controllers
    container.registerSingleton("RoadmapController", V1RoadmapController);
    container.registerSingleton("PostController", V1PostController);
    container.registerSingleton("UserController", V1UserController);
};
