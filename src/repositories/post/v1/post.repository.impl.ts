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
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary";
import Roadmap from "../../../schemas/roadmap";
import mongoose from "mongoose";
import { IPostDetails } from "../../../models/post.details";

@injectable()
class V1PostRepository implements IPostRepository {
  async getUserPostStats(userId: string): Promise<DataOrError<IUserPostStats>> {
    try {
      // Convert string userId to ObjectId for proper matching
      const userObjectId = new mongoose.Types.ObjectId(userId);

      const stats = await Post.aggregate([
        { $match: { authorId: userObjectId } },
        {
          $group: {
            _id: null,
            totalPosts: { $sum: 1 },
            totalLikes: { $sum: "$likes" },
            totalViews: { $sum: "$views" },
          },
        },
      ]);
      if (!stats || stats.length === 0) {
        return {
          data: {
            totalPosts: 0,
            totalLikes: 0,
            totalViews: 0,
          },
          error: null,
        };
      }
      return { data: stats[0], error: null };
    } catch (error) {
      logger.error(error, "Error getting user post stats");
      return {
        data: null,
        error: new DatabaseError("Failed to get user post stats"),
      };
    }
  }
  async getPostDetails(userId: string, postId: string): Promise<DataOrError<IPostDetails>> {
    try {

      // find the post
      const post = await Post.findById(postId).populate("author");
      if (!post) {
        return {
          data: null,
          error: new NotFoundError("Post not found")
        };
      }

      // check if post has already been saved by the user
      const savedRoadmapId = await Roadmap.exists({
        userId,
        postId
      });

      const isSaved = savedRoadmapId !== null;

      // preserve the roadmap from being removed during toJson

      const fullPost = post.toObject();
      delete fullPost._id;
      const data: IPostDetails = {
        post: fullPost,
        isSaved
      };
      return { data, error: null };

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
      const posts: IPost[] = await Post.find({
        createdAt: {
          $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
        },
      })
        .populate("author")
        .limit(limit)
        .skip(skip)
        .sort({ likes: -1 })
        .exec();

      console.log(posts);

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
        .populate("author")
        .sort({ likes: -1 })
        .limit(limit)
        .skip(skip)
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
    roadmap: IRoadmap,
    bannerImageBuffer: Buffer
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

      const options: UploadApiOptions = {
        unique_filename: false,
        overwrite: true,
        public_id: userId,
        folder: "roadmap_ai/avatars",
        transformation: [
          { width: 200, height: 200, crop: "fill" },
          { quality: "auto", fetch_format: "auto" },
        ],
        resource_type: "image",
        use_filename: false,
      };

      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(options, (error, result) => {
            if (error) {
              logger.error(error, "Error uploading avatar");
              return reject(error);
            } else {
              if (!result) {
                logger.error("No result returned from upload");
                return reject(
                  new Error("No result returned from upload")
                );
              }
              return resolve(result!);
            }
          })
          .end(bannerImageBuffer);
      });

      const post = new Post({
        authorId: userId,
        roadmap,
        bannerImage: result.secure_url
      });

      const savedPost = await post.save();

      // mark the roadmap as posted

      await Roadmap.updateOne({ _id: roadmap.id }, { postId: savedPost._id }).exec();

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

        .populate("author", "username email avatar")
        .sort({ createdAt: -1 })
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
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .populate("author")
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
