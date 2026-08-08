import { Router } from "express";

import {
  inventory,
  customers,
  challans,
} from "../controllers/report.controller";

import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/inventory", authenticate, inventory);

router.get("/customers", authenticate, customers);

router.get("/challans", authenticate, challans);

export default router;