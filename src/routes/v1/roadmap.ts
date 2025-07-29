import { Router } from "express";
import { container } from "tsyringe";
import IRoadmapController from "../../controllers/roadmap/roadmap.controller.interface";
import checkToken from "../../middlewares/check.token";

const router = Router();

const controller: IRoadmapController = container.resolve("RoadmapController");

router.get("/", controller.getPrivateRoadmaps);
router.get("/generate", controller.generateRoadmap);
router.post("/save", controller.saveRoadmap);
router.delete("/delete/:roadmapId", controller.deleteRoadmap);
router.patch(
  "/:roadmapId/:subgoalId/:goalId",
  controller.setRoadmapSubgoalStatus
);

export default router;
