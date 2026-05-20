import {
  CommentStatus,
  Post,
  PostStatus,
} from "../../../generated/prisma/client";
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
      include: {
        _count: {
          select: { comments: true },
        },
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

/*
! Note: We are using a transaction here to ensure that the view count is incremented atomically with fetching the post. This prevents race conditions where multiple requests to the same post could lead to inconsistent view counts. The transaction will ensure that both operations (incrementing views and fetching the post) are treated as a single unit of work, maintaining data integrity.
*/

const getPostById = async (postId: string) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.post.update({
        where: { id: postId },
        data: {
          views: { increment: 1 },
        },
      });
      const post = await tx.post.findUnique({
        where: { id: postId },
        include: {
          comments: {
            where: { parentId: null, status: CommentStatus.APPROVED },
            orderBy: { createdAt: "desc" },
            include: {
              replies: {
                where: { status: CommentStatus.APPROVED },
                orderBy: { createdAt: "asc" },
                include: {
                  replies: {
                    where: { status: CommentStatus.APPROVED },
                    orderBy: { createdAt: "asc" },
                    include: {
                      replies: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: { comments: true },
          },
        },
      });
      if (!post) {
        throw new Error("Post not found");
      }
      return post;
    });

    return result;
  } catch (error) {
    throw new Error("Error fetching post");
  }
};

const getMyPosts = async (authorId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: authorId, status: "ACTIVE" },
  });

  const result = await prisma.post.findMany({
    where: { authorId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { comments: true },
      },
    },
  });

  // const total = await prisma.post.aggregate({
  //   where: { authorId },
  //   _count: {
  //     id: true,
  //   },
  // });

  const total = await prisma.post.count({
    where: { authorId },
  });

  return { data: result, meta: { total } };
};

const updatePost = async (
  postId: string,
  data: Partial<Post>,
  authorId: string,
) => {
  const existingPost = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
    select: { authorId: true },
  });

  if (existingPost.authorId !== authorId) {
    throw new Error("Unauthorized: You are not the owner of this post");
  }

  const result = await prisma.post.update({
    where: { id: postId },
    data,
  });

  return result;
};

export const PostService = {
  createPost,
  getAllPosts,
  getPostById,
  getMyPosts,
  updatePost,
};
