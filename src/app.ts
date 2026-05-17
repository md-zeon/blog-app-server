import express, { Application } from "express";
import { PostRouter } from "./modules/post/post.router";

const app: Application = express();

app.use(express.json());
app.use("/api/posts", PostRouter);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

export default app;
