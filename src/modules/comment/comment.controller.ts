import { Request, Response } from "express";
import { CommentService } from "./comment.service";

const createComment = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized: You must be logged in to create a comment",
      });
    }

    req.body.authorId = user.id;

    const result = await CommentService.createComment(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      error: "Failed to create comment",
      message: error.message,
      details: error,
    });
  }
};

const getCommentById = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const comment = await CommentService.getCommentById(commentId as string);
    if (!comment) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }
    res.json(comment);
  } catch (error: any) {
    res.status(400).json({
      error: "Failed to get comment",
      message: error.message,
      details: error,
    });
  }
};

const getCommentsByAuthorId = async (req: Request, res: Response) => {
  try {
    const { authorId } = req.params;
    const comments = await CommentService.getCommentsByAuthorId(
      authorId as string,
    );
    res.json(comments);
  } catch (error: any) {
    res.status(400).json({
      error: "Failed to get comments",
      message: error.message,
      details: error,
    });
  }
};

export const CommentController = {
  createComment,
  getCommentById,
  getCommentsByAuthorId,
};
