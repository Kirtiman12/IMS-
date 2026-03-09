import { Router } from "express";
import { getStats, getLowStockItems } from "@/controllers/dashboard.controller";
import { authenticate } from "@/middleware/authenticate";

const router = Router();

router.use(authenticate);
router.get("/stats",     getStats);
router.get("/low-stock", getLowStockItems);

export default router;
