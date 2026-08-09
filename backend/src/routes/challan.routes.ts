import { Router } from "express";

import {
  create,
  getAll,
  getOne,
  remove,
} from "../controllers/challan.controller";

import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

import { Role } from "@prisma/client";

const router = Router();

router.get("/", authenticate, getAll);

router.get("/:id", authenticate, getOne);

router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN, Role.SALES),
  create
);

router.delete(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  remove
);

export default router;