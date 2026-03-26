import "dotenv/config";

import app from "./app";
import { connectDB } from "./config/db";
import { config } from "./config";

const { port } = config;

app.listen(port, async () => {
  await connectDB();
  console.log(`Server is running on port ${port}`);
});
