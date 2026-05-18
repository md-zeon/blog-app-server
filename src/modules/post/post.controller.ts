import { Request, Response } from "express";
import { PostService } from "./post.service";
import { PostStatus } from "../../../generated/prisma/client";

const createPost = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
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
    const {
      search,
      tags,
      isFeatured,
      status,
      authorId,
      page,
      limit,
      sortBy,
      sortOrder,
    } = req.query;

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

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const sortByParam = typeof sortBy === "string" ? sortBy : "createdAt";
    const sortOrderParam =
      typeof sortOrder === "string" &&
      ["asc", "desc"].includes(sortOrder.toLowerCase())
        ? (sortOrder.toLowerCase() as "asc" | "desc")
        : "desc";

    const result = await PostService.getAllPosts({
      search: searchParam,
      tags: tagsParam,
      isFeatured: isFeaturedParam,
      status: statusParam,
      authorId: authorIdParam,
      page: pageNum,
      limit: limitNum,
      sortBy: sortByParam,
      sortOrder: sortOrderParam,
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

export const PostController = {
  createPost,
  getAllPosts,
};
