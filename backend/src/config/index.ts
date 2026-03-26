import "dotenv/config";

export const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL || "mongodb://localhost:27017/myapp",
  jwtSecret: process.env.JWT_SECRET || "your_jwt_secret",
};
