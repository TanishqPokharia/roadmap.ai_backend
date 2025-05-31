import RoadmapGoalModel from "../../models/roadmap.goal";
import Either from "../../utils/either";

export interface RoadmapRepository {
  generateRoadmap(topic: string): Promise<Either<RoadmapGoalModel[]>>;
}
