import { IPostDetails } from "../../models/post.details";
import IRoadmap from "../../models/roadmap";
import DataOrError from "../../utils/data.or.error";

export default interface IRoadmapRepository {
  generateRoadmap(topic: string): Promise<DataOrError<IRoadmap>>;
  saveRoadmap(userId: string, roadmap: IRoadmap): Promise<DataOrError<string>>; // return a success message
  savePostRoadmap(userId: string, roadmap: IRoadmap, postId: string): Promise<DataOrError<string>>;
  deleteRoadmap(roadmapId: string): Promise<DataOrError<string>>; // return a success message
  getPrivateRoadmapsMetaData(
    userId: string,
    limit: number,
    offset: number
  ): Promise<DataOrError<IRoadmapMetaData[]>>;
  getPrivateRoadmap(userId: string, roadmapId: string): Promise<DataOrError<IRoadmap>>;
  setRoadmapSubgoalStatus(
    roadmapId: string,
    goalId: string,
    subgoalId: string,
    status: boolean
  ): Promise<DataOrError<string>>; // return a success message
}
