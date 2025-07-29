import IPost from "../../models/post";
import IRoadmap from "../../models/roadmap";
import DataOrError from "../../utils/either";

export default interface IPostRepository {
  getPopularPosts(limit: number, skip: number): Promise<DataOrError<IPost[]>>;
  getPostsByTitle(
    topic: string,
    limit: number,
    skip: number
  ): Promise<DataOrError<IPost[]>>;
  uploadPost(userId: string, roadmap: IRoadmap): Promise<DataOrError<string>>;
  getPostsByTime(
    time: PostTime,
    limit: number,
    skip: number
  ): Promise<DataOrError<IPost[]>>;
  togglePostLike(userId: string, postId: string): Promise<DataOrError<string>>;
  getPostsByAuthor(
    authorId: string,
    limit: number,
    skip: number
  ): Promise<DataOrError<IPost[]>>;
}

export type PostTime = "day" | "week" | "month" | "year";
