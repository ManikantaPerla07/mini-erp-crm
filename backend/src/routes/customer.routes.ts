import { Router } from "express";

import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "../controllers/customer.controller";

import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

import { Role } from "@prisma/client";

const router = Router();

// Any logged-in user
router.get("/", authenticate, getAll);
router.get("/:id", authenticate, getOne);

// Only ADMIN
router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  create
);

router.put(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  update
);

router.delete(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  remove
);

export default router;