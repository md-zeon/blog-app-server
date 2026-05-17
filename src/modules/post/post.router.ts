import { Router } from "express";
import { PostController } from "./post.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();

// Create a new post
router.post("/", auth(UserRole.USER), PostController.createPost);

// get all posts
router.get("/", PostController.getAllPosts);
export const PostRouter: Router = router;
