import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import type { AuthenticatedRequest } from "../types/request";
import { config } from "../config";

const { jwtSecret } = config;

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  // Middleware to authenticate requests using JWT
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header missing" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
      username: string;
    };
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
