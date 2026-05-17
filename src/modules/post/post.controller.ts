import { Request, Response } from "express";

const createPost = (req: Request, res: Response) => {
  // Logic to create a new post
  const { title, content } = req.body;
  res.status(201).json({
    title,
    content,
    message: "Post created successfully",
  });
};

export const PostController = {
  createPost,
};
