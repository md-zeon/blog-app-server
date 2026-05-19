import { Router } from "express";
import { PostController } from "./post.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();

// get all posts
router.get("/", PostController.getAllPosts);

// Create a new post
router.post("/", auth(UserRole.USER), PostController.createPost);

// get a single post
router.get("/:postId", PostController.getPostById);

export const PostRouter: Router = router;
