import express from "express";
import { logger } from "./middlewares/logger";
import { errorHandler } from "./middlewares/errorHandler";
import authRouter from "./routes/authRoute";
import postRouter from "./routes/postRoute";

const app = express();

app.use(logger);
app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/posts", postRouter);

app.get("/", (req, res) => {
  res.send("Welcome to Social Media API!");
});

app.use(errorHandler);

export default app;
