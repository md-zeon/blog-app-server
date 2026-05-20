import { Request, Response } from "express";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: "Route Not Found",
    path: req.originalUrl,
    message: `The requested route ${req.originalUrl} was not found on this server.`,
    date: new Date().toDateString(),
  });
}
