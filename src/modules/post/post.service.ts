import { Post } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt">,
) => {
  try {
    const result = await prisma.post.create({
      data,
    });
    return result;
  } catch (error) {
    throw new Error("Error creating post");
  }
};

const getAllPosts = async () => {
  try {
    const result = await prisma.post.findMany();
    return result;
  } catch (error) {
    throw new Error("Error fetching posts");
  }
};

export const PostService = {
  createPost,
  getAllPosts,
};
