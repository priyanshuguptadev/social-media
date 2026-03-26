import type { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Global error handling middleware
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
};

export { errorHandler };
