import { Router } from "express";
import { container } from "tsyringe";
import { RoadmapController } from "../../controllers/roadmap/interface";

const router = Router();

const controller: RoadmapController = container.resolve("RoadmapController");

router.get("/generate", controller.generateRoadmap);
router.get("/", (req, res) => {
  console.log("HIT");
  res.status(200).json({ message: "Roadmap API is working!" });
});
export default router;
