import { Router } from "express";
import { container } from "tsyringe";
import IRoadmapController from "../../controllers/roadmap/roadmap.controller.interface";
import checkToken from "../../middlewares/check.token";

const router = Router();

const controller: IRoadmapController = container.resolve("RoadmapController");

router.use(checkToken);
router.get("/", controller.getPrivateRoadmapsMetaData);
router.get("/generate", controller.generateRoadmap);
router.get("/:roadmapId", controller.getPrivateRoadmap);
router.post("/save", controller.saveRoadmap);
router.post("/save/post", controller.savePostRoadmap);
router.delete("/delete/:roadmapId", controller.deleteRoadmap);
router.patch(
  "/:roadmapId/:goalId/:subgoalId/:status",
  controller.setRoadmapSubgoalStatus
);

export default router;
