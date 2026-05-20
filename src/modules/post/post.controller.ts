import { Request, Response } from "express";
import { PostService } from "./post.service";
import { PostStatus } from "../../../generated/prisma/client";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { UserRole } from "../../middlewares/auth";

const createPost = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized: You must be logged in to create a post",
      });
    }
    const result = await PostService.createPost(req.body, req.user.id);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      error: "Post creation Failed",
      message: error.message,
      details: error.stack,
    });
  }
};

const getAllPosts = async (req: Request, res: Response) => {
  try {
    const { search, tags, isFeatured, status, authorId } = req.query;

    const searchParam = typeof search === "string" ? search : undefined;
    const tagsParam = typeof tags === "string" ? tags.split(",") : undefined;
    const isFeaturedParam =
      typeof isFeatured === "string"
        ? isFeatured === "true"
          ? true
          : isFeatured === "false"
            ? false
            : undefined
        : undefined;

    const statusParam =
      typeof status === "string"
        ? status === PostStatus.PUBLISHED
          ? PostStatus.PUBLISHED
          : status === PostStatus.DRAFT
            ? PostStatus.DRAFT
            : status === PostStatus.ARCHIVED
              ? PostStatus.ARCHIVED
              : undefined
        : undefined;

    const authorIdParam = typeof authorId === "string" ? authorId : undefined;

    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(
      req.query,
    );

    const result = await PostService.getAllPosts({
      search: searchParam,
      tags: tagsParam,
      isFeatured: isFeaturedParam,
      status: statusParam,
      authorId: authorIdParam,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch posts",
      message: error.message,
      details: error.stack,
    });
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      throw new Error("Post ID is required");
    }
    const result = await PostService.getPostById(postId as string);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({
      error: "Post not found",
      message: error.message,
      details: error.stack,
    });
  }
};

const getMyPosts = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      throw new Error("Unauthorized: You must be logged in to view your posts");
    }
    console.log("Fetching posts for user ID:", user.id);

    const result = await PostService.getMyPosts(user?.id);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch your posts",
      message: error.message,
      details: error,
    });
  }
};

const updatePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const user = req.user;
    const isAdmin = user?.role === UserRole.ADMIN;
    if (!user) {
      throw new Error("Unauthorized: You must be logged in to update a post");
    }
    const result = await PostService.updatePost(
      postId as string,
      req.body,
      user.id,
      isAdmin,
    );
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      error: "Failed to update post",
      message: error.message,
      details: error.stack,
    });
  }
};

const deletePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const user = req.user;
    const isAdmin = user?.role === UserRole.ADMIN;

    if (!user) {
      throw new Error("Unauthorized: You must be logged in to delete a post");
    }
    const result = await PostService.deletePost(
      postId as string,
      user.id,
      isAdmin,
    );
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      error: "Failed to delete post",
      message: error.message,
      details: error.stack,
    });
  }
};

export const PostController = {
  createPost,
  getAllPosts,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
};
