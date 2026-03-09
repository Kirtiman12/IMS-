import "dotenv/config";
import app from "./app";
import { PrismaClient } from "@prisma/client";

const PORT = process.env.PORT ?? 5000;
const prisma = new PrismaClient();

const start = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

start();
