import { Router } from "express";
import { getHistory, create } from "@/controllers/stock.controller";
import { authenticate } from "@/middleware/authenticate";
import { authorize }    from "@/middleware/authorize";

const router = Router();

router.use(authenticate);
router.get ("/" , getHistory);
router.post("/",  authorize("ADMIN", "MANAGER"), create);

export default router;
