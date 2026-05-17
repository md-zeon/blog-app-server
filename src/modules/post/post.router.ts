import express, { Router } from "express";
import { PostController } from "./post.controller";

const router = express.Router();

// Create a new post
router.post("/", PostController.createPost);

// get all posts
router.get("/", PostController.getAllPosts);
export const PostRouter: Router = router;
