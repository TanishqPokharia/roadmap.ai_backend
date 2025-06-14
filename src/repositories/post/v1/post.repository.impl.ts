import { injectable } from "tsyringe";
import IPost from "../../../models/post";
import IRoadmap from "../../../models/roadmap";
import Likes from "../../../schemas/likes";
import Post from "../../../schemas/post";
import DataOrError from "../../../utils/either";
import logger from "../../../utils/logger";
import IPostRepository, { PostTime } from "../post.repository.interface";
import User from "../../../schemas/user";

@injectable()
class V1PostRepository implements IPostRepository {
  async getPopularPosts(
    limit: number,
    skip: number
  ): Promise<DataOrError<IPost[]>> {
    try {
      const posts = await Post.find({
        createdAt: {
          $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        },
      })
        .limit(limit)
        .skip(skip)
        .sort({ likes: -1 })
        .exec();

      return { data: posts, error: null };
    } catch (error) {
      logger.error(error, "Error getting popular posts");
      return {
        data: null,
        error: new Error(
          `Failed to get popular posts: ${(error as Error).message}`
        ),
      };
    }
  }
  async getPostsByTitle(
    topic: string,
    limit: number,
    skip: number
  ): Promise<DataOrError<IPost[]>> {
    try {
      const posts = await Post.find({
        "roadmap.title": { $regex: topic, $options: "i" },
      })
        .sort({ likes: -1 })
        .limit(limit)
        .skip(skip)
        .exec();

      return { data: posts, error: null };
    } catch (error) {
      logger.error(error, "Error getting posts by title");
      return {
        data: null,
        error: new Error(
          `Failed to get posts by title: ${(error as Error).message}`
        ),
      };
    }
  }
  async uploadPost(
    userId: string,
    roadmap: IRoadmap
  ): Promise<DataOrError<string>> {
    try {
      const userInfo = await User.findById(userId, "username email ", {
        limit: 1,
      });

      if (!userInfo) {
        return {
          data: null,
          error: new Error("User not found"),
        };
      }

      const { email, username } = userInfo;
      const post = new Post({
        userId,
        roadmap,
        author: {
          username,
          email,
        },
      });

      const savedPost = await post.save();
      return { data: savedPost._id.toString(), error: null };
    } catch (error) {
      logger.error(error, "Error uploading post");
      return {
        data: null,
        error: new Error(`Failed to upload post: ${(error as Error).message}`),
      };
    }
  }
  async getPostsByTime(
    time: PostTime,
    limit: number,
    skip: number
  ): Promise<DataOrError<IPost[]>> {
    try {
      const timeMap: Record<PostTime, number> = {
        day: 1,
        week: 7,
        month: 30,
        year: 365,
      };

      const posts = await Post.find({
        createdAt: {
          $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * timeMap[time]),
        },
      })
        .limit(limit)
        .skip(skip)
        .exec();

      return { data: posts, error: null };
    } catch (error) {
      logger.error(error, "Error getting posts by time");
      return {
        data: null,
        error: new Error(
          `Failed to get posts by time: ${(error as Error).message}`
        ),
      };
    }
  }
  async togglePostLike(
    userId: string,
    postId: string
  ): Promise<DataOrError<string>> {
    try {
      const likedEntry = await Likes.findOne({ userId, postId }).exec();
      const isAlreadyLiked = likedEntry !== null;
      if (isAlreadyLiked) {
        await Likes.deleteOne({ userId, postId }).exec();
      } else {
        const like = new Likes({
          userId,
          postId,
        });
        await like.save();
      }
      const post = await Post.findOneAndUpdate(
        { _id: postId },
        {
          $inc: { likes: isAlreadyLiked ? -1 : 1 },
        }
      ).exec();
      if (!post) {
        return {
          data: null,
          error: new Error("Post not found"),
        };
      }
      return {
        data: isAlreadyLiked ? "Post unliked" : "Post liked",
        error: null,
      };
    } catch (error) {
      logger.error(error, "Error toggling post like");
      return {
        data: null,
        error: new Error(
          `Failed to toggle post like: ${(error as Error).message}`
        ),
      };
    }
  }
}

export default V1PostRepository;
