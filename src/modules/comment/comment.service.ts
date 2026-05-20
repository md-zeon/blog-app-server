import { CommentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const createComment = async (payload: {
  postId: string;
  content: string;
  authorId: string;
  parentId?: string;
}) => {
  await prisma.post.findUniqueOrThrow({
    where: {
      id: payload.postId,
    },
  });

  if (payload.parentId) {
    await prisma.comment.findUniqueOrThrow({
      where: {
        id: payload.parentId,
      },
    });
  }

  const result = await prisma.comment.create({
    data: payload,
  });

  return result;
};

const getCommentById = async (commentId: string) => {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          views: true,
        },
      },
    },
  });

  return comment;
};

const getCommentsByAuthorId = async (authorId: string) => {
  const comments = await prisma.comment.findMany({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          views: true,
        },
      },
    },
  });

  return comments;
};

const deleteComment = async (commentId: string) => {
  await prisma.comment.delete({
    where: {
      id: commentId,
    },
  });
};

const updateComment = async (
  commentId: string,
  content: { content?: string; status?: CommentStatus },
  authorId: string,
) => {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
      authorId,
    },
  });

  if (!comment) {
    throw new Error(`Comment not found with id ${commentId}`);
  }

  if (comment.authorId !== authorId) {
    throw new Error("You are not the owner of this comment");
  }

  const result = await prisma.comment.update({
    where: {
      id: commentId,
      authorId,
    },
    data: content,
  });

  return result;
};

const moderateComment = async (commentId: string, status: CommentStatus) => {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!comment) {
    throw new Error(`Comment not found with id ${commentId}`);
  }

  if (comment.status === status) {
    throw new Error(`Comment is already in status ${status}, no update needed`);
  }

  const result = await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      status,
    },
  });

  return result;
};

export const CommentService = {
  createComment,
  getCommentById,
  getCommentsByAuthorId,
  deleteComment,
  updateComment,
  moderateComment,
};
