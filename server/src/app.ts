import express  from "express";
import cors   from "cors";
import cookieParser from "cookie-parser";
import "express-async-errors";

import authRoutes      from "./routes/auth.routes";
import productRoutes   from "@/routes/product.routes";
import stockRoutes     from "@/routes/stock.routes";
import vendorRoutes    from "@/routes/vendor.routes";
import dashboardRoutes from "@/routes/dashboard.routes";

const app = express();

app.use(cors({
  origin:      process.env.CLIENT_URL ?? "http://localhost:5173",
  credentials: true,   // ← required for httpOnly cookies
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth",      authRoutes);
app.use("/api/products",  productRoutes);
app.use("/api/stock",     stockRoutes);
app.use("/api/vendors",   vendorRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  const status  = err.status ?? 500;
  const message = err.message ?? "Internal server error";
  res.status(status).json({ message });
});

export default app;
