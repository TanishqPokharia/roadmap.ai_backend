import { inject, injectable } from "tsyringe";
import IPostController from "../post.controller.interface";
import { Request, Response } from "express";
import IPostRepository from "../../../repositories/post/post.repository.interface";
import { z } from "zod/v4";

@injectable()
class V1PostController implements IPostController {
  constructor(@inject("PostRepository") private repo: IPostRepository) {}
  getPopularPosts = async (req: Request, res: Response): Promise<void> => {
    const { limit, offset } = req.query;
    const popularPostsSchema = z.object({
      limit: z.number().int().nonnegative(),
      offset: z.number().int().nonnegative(),
    });
    const validation = popularPostsSchema.safeParse({
      limit: limit,
      offset: offset,
    });
    if (!validation.success) {
      res.status(400).json({ error: z.prettifyError(validation.error) });
      return;
    }
    const validated = validation.data;
    const { data: posts, error } = await this.repo.getPopularPosts(
      validated.limit,
      validated.offset
    );
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ posts });
  };
  getPostsByTitle = async (req: Request, res: Response): Promise<void> => {
    const { title, limit, offset } = req.query;

    // validate params
    const postTitleSchema = z.object({
      title: z.string().min(10, "Proper title is required").max(100),
      limit: z.number().int().nonnegative(),
      offset: z.number().int().nonnegative(),
    });

    const validation = postTitleSchema.safeParse({
      title,
      limit: limit,
      offset: offset,
    });

    if (!validation.success) {
      res.status(400).json({ error: validation.error.message });
      return;
    }

    const validated = validation.data;
    const { data: posts, error } = await this.repo.getPostsByTitle(
      validated.title,
      validated.limit,
      validated.offset
    );

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ posts });
  };
  uploadPost = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    const { title, roadmap } = req.body;

    // validate params
    const post = z.object({
      title: z.string().min(1, "Title is required").max(100),
      userId: z.string().min(1, "User ID is required"),
      roadmap: z.object({
        id: z.string().min(1, "Roadmap ID is required"),
        title: z.string().min(1, "Roadmap title is required").max(100),
        goals: z.array(z.any()).min(1, "Roadmap must have at least one goal"),
      }),
    });

    const validation = post.safeParse({
      title,
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
      validated.title,
      roadmap
    );
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(201).json({ post: data });
  };
  getPostsByTime = async (req: Request, res: Response): Promise<void> => {
    const { time, limit, offset } = req.query;

    // validate params
    const postTimeSchema = z.object({
      time: z.enum(["day", "week", "month", "year"]),
      limit: z.number().int().nonnegative(),
      offset: z.number().int().nonnegative(),
    });

    const validation = postTimeSchema.safeParse({
      time,
      limit: limit,
      offset: offset,
    });

    if (!validation.success) {
      res.status(400).json({ error: z.prettifyError(validation.error) });
      return;
    }

    const validated = validation.data;
    const { data: posts, error } = await this.repo.getPostsByTime(
      validated.time,
      validated.limit,
      validated.offset
    );

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ posts });
  };
  togglePostLike = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
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
