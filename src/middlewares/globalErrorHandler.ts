import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errorDetails = err;

  // Handle PrismaClientValidationError
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "You provided incorrect fields type or missing required fields.";
  }

  // Handle PrismaClientKnownRequestError
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 404;
      message = "The requested resource was not found.";
    } else if (err.code === "P2002") {
      statusCode = 409;
      message = "A record with this value already exists.";
    } else if (err.code === "P2003") {
      statusCode = 400;
      message =
        "Foreign key constraint failed. The related record does not exist.";
    }
  }

  // Handle PrismaClientUnknownRequestError
  else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    message = "An unknown error occurred while processing the request.";
  }

  // Handle PrismaClientRustPanicError
  else if (err instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = 500;
    message = "A panic occurred in the Prisma Client.";
  }

  // Handle PrismaClientInitializationError
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = 401;
      message =
        "Authentication failed. Please check your database credentials.";
    } else if (err.errorCode === "P1001") {
      statusCode = 503;
      message = "Database server is not reachable. Please try again later.";
    } else if (err.errorCode === "P1002") {
      statusCode = 503;
      message = "Connection timed out. Please try again later.";
    } else if (err.errorCode === "P1003") {
      statusCode = 503;
      message = "Database server is not responding. Please try again later.";
    } else {
      statusCode = 500;
      message = "An error occurred during Prisma Client initialization.";
    }
  }

  res.status(statusCode).json({ message, errorDetails });
}

export default errorHandler;
