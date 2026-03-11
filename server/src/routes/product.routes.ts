import { Router } from "express";
import { getAll, getById, create, update, remove } from "@/controllers/product.controller";
import { authenticate } from "@/middleware/authenticate";
import { authorize }    from "@/middleware/authorize";

const router = Router();

router.use(authenticate);

router.get   ("/",    getAll);
router.get   ("/:id", getById);
router.post  ("/",    authorize("ADMIN", "MANAGER"), create);
router.put   ("/:id", authorize("ADMIN", "MANAGER"), update);
router.delete("/:id", authorize("ADMIN"),             remove);

export default router;
