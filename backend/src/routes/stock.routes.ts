import { Router } from "express";

import {
  create,
  getAll,
  getOne,
} from "../controllers/stock.controller";

import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

import { Role } from "@prisma/client";

const router = Router();

router.get("/", authenticate, getAll);

router.get("/:id", authenticate, getOne);

router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  create
);

export default router;