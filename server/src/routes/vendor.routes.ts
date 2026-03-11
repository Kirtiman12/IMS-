import { Router } from "express";
import { getAll, create,  createPurchase } from "@/controllers/vendor.controller";
import { authenticate } from "@/middleware/authenticate";
import { authorize }    from "@/middleware/authorize";

const router = Router();

router.use(authenticate);
router.get ("/" ,            getAll);
router.post("/" ,            authorize("ADMIN"), create);
// router.get ("/:id/purchases",getPurchases);
router.post("/:id/purchases",authorize("ADMIN", "MANAGER"), createPurchase);

export default router;
