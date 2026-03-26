import mongoose from "mongoose";

import { config } from ".";

const connectDB = async () => {
  try {
    const { databaseUrl } = config;
    await mongoose.connect(databaseUrl);
    console.log("MongoDB connected!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export { connectDB };
