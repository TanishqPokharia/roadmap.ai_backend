import { injectable } from "tsyringe";
import IPost from "../../../models/post";
import IRoadmap from "../../../models/roadmap";
import Likes from "../../../schemas/likes";
import Post from "../../../schemas/post";
import DataOrError from "../../../utils/either";
import { logger } from "../../../utils/logger";
import IPostRepository, { PostTime } from "../post.repository.interface";
import User from "../../../schemas/user";
import Views from "../../../schemas/views";
import { NotFoundError, DatabaseError } from "../../../utils/errors";

@injectable()
class V1PostRepository implements IPostRepository {
  async getPostedRoadmap(postId: string): Promise<DataOrError<IRoadmap>> {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        return {
          data: null,
          error: new NotFoundError("Post not found")
        };
      }

      const roadmap = post.roadmap;
      return { data: roadmap, error: null };

    } catch (error) {
      logger.error(error, "Error getting roadmap from the post");
      return {
        data: null,
        error: new DatabaseError("Failed to get roadmap from the post")
      };
    }
  }
  async getPopularPosts(
    limit: number,
    skip: number
  ): Promise<DataOrError<IPost[]>> {
    try {
      const posts = await Post.find({
        createdAt: {
          $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
        },
      }).select({
        roadmap: 0 // exclude the roadmap
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
        error: new DatabaseError(
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
        .populate("author", "username email avatar id")
        .exec();

      return { data: posts, error: null };
    } catch (error) {
      logger.error(error, "Error getting posts by title");
      return {
        data: null,
        error: new DatabaseError(
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
          error: new NotFoundError("User not found"),
        };
      }

      const post = new Post({
        authorId: userId,
        roadmap,
      });

      const savedPost = await post.save();
      return { data: savedPost._id.toString(), error: null };
    } catch (error) {
      logger.error(error, "Error uploading post");
      return {
        data: null,
        error: new DatabaseError(`Failed to upload post: ${(error as Error).message}`),
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
        error: new DatabaseError(
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
          error: new NotFoundError("Post not found"),
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
        error: new DatabaseError(
          `Failed to toggle post like: ${(error as Error).message}`
        ),
      };
    }
  }

  async getUserPostsMetaData(
    userId: string,
    limit: number,
    skip: number
  ): Promise<DataOrError<IPost[]>> {
    try {
      const posts = await Post.find({ authorId: userId })
        .select({
          roadmap: 0 // exclude the roadmap
        })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .populate("author", "username email avatar")
        .exec();

      return { data: posts, error: null };
    } catch (error) {
      logger.error(error, "Error getting user posted roadmaps");
      return {
        data: null,
        error: new DatabaseError(
          `Failed to get user posted roadmaps: ${(error as Error).message}`
        ),
      };
    }
  }

  async getUserPostRoadmap(
    userId: string,
    postId: string
  ): Promise<DataOrError<IRoadmap>> {
    try {
      const post = await Post.findOne({ _id: postId, authorId: userId })
        .populate("roadmap")
        .exec();

      if (!post) {
        return {
          data: null,
          error: new NotFoundError("Post not found or does not belong to user"),
        };
      }

      return { data: post.roadmap, error: null };
    } catch (error) {
      logger.error(error, "Error getting user posted roadmap");
      return {
        data: null,
        error: new DatabaseError(
          `Failed to get user posted roadmap: ${(error as Error).message}`
        ),
      };
    }
  }

  async getPostsByAuthor(
    authorId: string,
    limit: number,
    skip: number
  ): Promise<DataOrError<IPost[]>> {
    try {
      const posts = await Post.find()
        .where({
          authorId,
        })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .populate("author", "username email avatar")
        .exec();

      return { data: posts, error: null };
    } catch (error) {
      logger.error(error, "Error getting posts by author");
      return {
        data: null,
        error: new DatabaseError(
          `Failed to get posts by author: ${(error as Error).message}`
        ),
      };
    }
  }

  async toggleView(userId: string, postId: string): Promise<DataOrError<void>> {
    try {
      // check if the post is viewd by the user
      const isViewed = await Views.findOne({ userId, postId });
      // do nothing if the post is already viewed
      if (isViewed) return { data: null, error: null };

      // if it is not viewed, add the entry in the Views collection and increment the views count in the post
      await Views.create({ userId, postId });
      await Post.updateOne({ _id: postId }, { $inc: { views: 1 } });
      return { data: null, error: null };
    } catch (error) {
      logger.error(error, "Error checking viewed or updating view count");
      return {
        data: null,
        error: new DatabaseError(`Failed to check or increase views: ${(error as Error).message}`)
      };
    }
  }
}

export default V1PostRepository;
