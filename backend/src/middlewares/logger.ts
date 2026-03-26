import type { Request, Response, NextFunction } from "express";

const logger = (req: Request, res: Response, next: NextFunction) => {
  // Simple logging middleware to log incoming requests
  console.log(`${req.method} ${req.url}`);
  next();
};

export { logger };
