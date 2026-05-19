import { Post, PostStatus, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">,
  userId: string,
) => {
  try {
    const result = await prisma.post.create({
      data: {
        ...data,
        authorId: userId,
      },
    });
    return result;
  } catch (error) {
    throw new Error("Error creating post");
  }
};

const getAllPosts = async (payload: {
  search?: string | undefined;
  tags?: string[] | undefined;
  isFeatured?: boolean | undefined;
  status?: PostStatus | undefined;
  authorId?: string | undefined;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) => {
  try {
    const {
      search,
      tags,
      isFeatured,
      status,
      authorId,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    } = payload;
    const andConditions: Prisma.PostWhereInput[] = [];

    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
          { tags: { has: search } },
        ],
      });
    }

    if (tags && tags.length > 0) {
      andConditions.push({ tags: { hasSome: tags } });
    }

    if (typeof isFeatured === "boolean") {
      andConditions.push({ isFeatured: isFeatured });
    }

    if (status) {
      andConditions.push({ status: status });
    }

    if (authorId) {
      andConditions.push({ authorId: authorId });
    }

    const result = await prisma.post.findMany({
      take: limit,
      skip: skip,
      where: {
        AND: andConditions,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const total = await prisma.post.count({
      where: {
        AND: andConditions,
      },
    });

    return {
      data: result,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        
      },
    };
  } catch (error) {
    throw new Error("Error fetching posts");
  }
};

export const PostService = {
  createPost,
  getAllPosts,
};
