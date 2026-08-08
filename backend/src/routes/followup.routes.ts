import { Router } from "express";
import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "../controllers/followup.controller";

import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, create);

router.get("/", authenticate, getAll);

router.get("/:id", authenticate, getOne);

router.put("/:id", authenticate, update);

router.delete("/:id", authenticate, remove);

export default router;