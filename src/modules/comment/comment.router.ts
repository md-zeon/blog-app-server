import { Router } from "express";
import { CommentController } from "./comment.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();

// create a new comment
router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN),
  CommentController.createComment,
);

// get a comment by id
router.get("/:commentId", CommentController.getCommentById);

// get comments by author id
router.get("/author/:authorId", CommentController.getCommentsByAuthorId);

export const CommentRouter: Router = router;
