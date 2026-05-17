import express, { Application } from "express";
import { PostRouter } from "./modules/post/post.router";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const app: Application = express();

// Apply authentication middleware to all routes under /api/auth
app.all("/api/auth/*splat", toNodeHandler(auth));
// *splat is a wildcard that matches any path after /api/auth/, allowing the auth middleware to be applied to all routes under that path.
// Enable JSON parsing for incoming requests
app.use(express.json());

// Post routes
app.use("/api/posts", PostRouter);

// Root route for testing
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

export default app;
