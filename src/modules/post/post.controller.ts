import { Request, Response } from "express";
import { PostService } from "./post.service";

const createPost = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }
    const result = await PostService.createPost(req.body, req.user.id);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: "Post creation Failed" });
  }
};

const getAllPosts = async (req: Request, res: Response) => {
  try {
    const result = await PostService.getAllPosts();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

export const PostController = {
  createPost,
  getAllPosts,
};
