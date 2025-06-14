import { inject, injectable } from "tsyringe";
import IPostController from "../post.controller.interface";
import { Request, Response } from "express";
import IPostRepository from "../../../repositories/post/post.repository.interface";
import { z } from "zod/v4";

@injectable()
class V1PostController implements IPostController {
  constructor(@inject("PostRepository") private repo: IPostRepository) {}
  getPopularPosts = async (req: Request, res: Response): Promise<void> => {
    const { limit, skip } = req.query;
    const popularPostsSchema = z.object({
      limit: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
      skip: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
    });
    const validation = popularPostsSchema.safeParse({
      limit,
      skip,
    });
    if (!validation.success) {
      res.status(400).json({ error: z.prettifyError(validation.error) });
      return;
    }
    const validated = validation.data;
    const { data: posts, error } = await this.repo.getPopularPosts(
      validated.limit,
      validated.skip
    );
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ posts });
  };
  getPostsByTitle = async (req: Request, res: Response): Promise<void> => {
    const { title, limit, skip } = req.query;
    // validate params
    const postTitleSchema = z.object({
      title: z.string().min(1, "Proper title is required").max(100),
      limit: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
      skip: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
    });

    const validation = postTitleSchema.safeParse({
      title,
      limit,
      skip,
    });

    if (!validation.success) {
      res.status(400).json({ error: z.prettifyError(validation.error) });
      return;
    }

    const validated = validation.data;
    const { data: posts, error } = await this.repo.getPostsByTitle(
      validated.title,
      validated.limit,
      validated.skip
    );

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ posts });
  };
  uploadPost = async (req: Request, res: Response): Promise<void> => {
    const userId = req.token;
    if (!req.body) {
      res.status(400).json({ error: "Request body is required" });
      return;
    }
    const { roadmap } = req.body;

    // validate params
    const post = z.object({
      userId: z.string().min(1, "User ID is required"),
      roadmap: z.object({
        _id: z.string().min(1, "Roadmap ID is required"),
        title: z.string().min(1, "Roadmap title is required").max(100),
        goals: z.array(z.any()).min(1, "Roadmap must have at least one goal"),
      }),
    });

    const validation = post.safeParse({
      userId,
      roadmap,
    });

    if (!validation.success) {
      res.status(400).json({ error: z.prettifyError(validation.error) });
      return;
    }

    const validated = validation.data;

    const { data, error } = await this.repo.uploadPost(
      validated.userId,
      roadmap
    );
    if (error) {
      if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(201).json({ post: data });
  };
  getPostsByTime = async (req: Request, res: Response): Promise<void> => {
    const { time, limit, skip } = req.query;

    // validate params
    const postTimeSchema = z.object({
      time: z.enum(["day", "week", "month", "year"]),
      limit: z.number().int().nonnegative(),
      skip: z.number().int().nonnegative(),
    });

    const validation = postTimeSchema.safeParse({
      time,
      limit: limit,
      skip: skip,
    });

    if (!validation.success) {
      res.status(400).json({ error: z.prettifyError(validation.error) });
      return;
    }

    const validated = validation.data;
    const { data: posts, error } = await this.repo.getPostsByTime(
      validated.time,
      validated.limit,
      validated.skip
    );

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ posts });
  };
  togglePostLike = async (req: Request, res: Response): Promise<void> => {
    const userId = req.token;
    const postId = req.params.postId;

    // validate params
    const toggleLikeSchema = z.object({
      userId: z.string().min(1, "User ID is required"),
      postId: z.string().min(1, "Post ID is required"),
    });

    const validation = toggleLikeSchema.safeParse({ userId, postId });

    if (!validation.success) {
      res.status(400).json({ error: z.prettifyError(validation.error) });
      return;
    }

    const validated = validation.data;

    const { data, error } = await this.repo.togglePostLike(
      validated.userId,
      validated.postId
    );
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ message: data });
  };
}

export default V1PostController;
