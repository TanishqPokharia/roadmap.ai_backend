import RoadmapSubgoalModel from "./roadmap.subgoal";

interface RoadmapGoalModel {
  goal: string;
  subgoals: RoadmapSubgoalModel[];
}

export default RoadmapGoalModel;
