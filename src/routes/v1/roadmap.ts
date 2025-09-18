import { Router } from "express";
import { container } from "tsyringe";
import IRoadmapController from "../../controllers/roadmap/roadmap.controller.interface";

const router = Router();

const controller: IRoadmapController = container.resolve("RoadmapController");

router.get("/", controller.getPrivateRoadmapsMetaData);
router.get("/generate", controller.generateRoadmap);
router.get("/:roadmapId", controller.getPrivateRoadmap);
router.post("/save", controller.saveRoadmap);
router.delete("/delete/:roadmapId", controller.deleteRoadmap);
router.patch(
  "/:roadmapId/:subgoalId/:goalId",
  controller.setRoadmapSubgoalStatus
);

export default router;
