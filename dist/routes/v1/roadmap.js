"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const check_token_1 = __importDefault(require("../../middlewares/check.token"));
const router = (0, express_1.Router)();
const controller = tsyringe_1.container.resolve("RoadmapController");
router.use(check_token_1.default);
router.get("/", controller.getPrivateRoadmapsMetaData);
router.get("/generate", controller.generateRoadmap);
router.get("/:roadmapId", controller.getPrivateRoadmap);
router.post("/save", controller.saveRoadmap);
router.post("/save/post", controller.savePostRoadmap);
router.delete("/delete/:roadmapId", controller.deleteRoadmap);
router.patch("/:roadmapId/:goalId/:subgoalId/:status", controller.setRoadmapSubgoalStatus);
exports.default = router;
