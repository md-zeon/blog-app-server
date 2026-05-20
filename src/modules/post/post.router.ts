import { Router } from "express";
import { PostController } from "./post.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();

// get all posts
router.get("/", PostController.getAllPosts);

// Create a new post
router.post("/", auth(UserRole.USER), PostController.createPost);

// get my posts
router.get(
  "/my-posts",
  auth(UserRole.USER, UserRole.ADMIN),
  PostController.getMyPosts,
);

// get a single post
router.get("/:postId", PostController.getPostById);

// update a post
router.patch(
  "/:postId",
  auth(UserRole.USER, UserRole.ADMIN),
  PostController.updatePost,
);

export const PostRouter: Router = router;
