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
  uploadPost(userId: string, roadmap: IRoadmap, bannerImage: Buffer): Promise<DataOrError<string>>;
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

  /**
   * Fetch roadmaps posted by a user
   */
  getUserPostsMetaData(
    userId: string,
    limit: number,
    skip: number
  ): Promise<DataOrError<IPost[]>>;
  /**
   * Fetch the roadmap of the selected post if it belongs to the user
   */
  getUserPostRoadmap(
    userId: string,
    postId: string
  ): Promise<DataOrError<IRoadmap>>;
  /**
   * Fetch the roadmap of the selected post
   */
  getPostedRoadmap(postId: string): Promise<DataOrError<IRoadmap>>
  /**
   * Increases the view count of post if previously not viewed by a user
   */
  toggleView(userId: string, postId: string): Promise<DataOrError<void>>;

  getUserPostStats(userId: string): Promise<DataOrError<IUserPostStats>>;

}

export type PostTime = "day" | "week" | "month" | "year";
