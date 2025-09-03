"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDependencies = void 0;
const tsyringe_1 = require("tsyringe");
const roadmap_repository_impl_1 = __importDefault(require("../repositories/roadmap/v1/roadmap.repository.impl"));
const roadmap_controller_impl_1 = __importDefault(require("../controllers/roadmap/v1/roadmap.controller.impl"));
const post_repository_impl_1 = __importDefault(require("../repositories/post/v1/post.repository.impl"));
const user_repository_impl_1 = __importDefault(require("../repositories/user/v1/user.repository.impl"));
const post_controller_impl_1 = __importDefault(require("../controllers/post/v1/post.controller.impl"));
const user_controller_impl_1 = __importDefault(require("../controllers/user/v1/user.controller.impl"));
const registerDependencies = () => {
    // register repositories
    tsyringe_1.container.registerSingleton("RoadmapRepository", roadmap_repository_impl_1.default);
    tsyringe_1.container.registerSingleton("PostRepository", post_repository_impl_1.default);
    tsyringe_1.container.registerSingleton("UserRepository", user_repository_impl_1.default);
    // register controllers
    tsyringe_1.container.registerSingleton("RoadmapController", roadmap_controller_impl_1.default);
    tsyringe_1.container.registerSingleton("PostController", post_controller_impl_1.default);
    tsyringe_1.container.registerSingleton("UserController", user_controller_impl_1.default);
};
exports.registerDependencies = registerDependencies;
