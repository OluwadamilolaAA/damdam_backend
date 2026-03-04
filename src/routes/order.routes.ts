import { Router } from "express";
import {
  adminListOrdersHandler,
  adminUpdateOrderStatusHandler,
  createOrderHandler,
  getOrderByIdHandler,
  myOrdersHandler,
} from "../controllers/order.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { Role } from "../models/user.model";

const router = Router();

router.use(requireAuth);

router.get("/admin/all", requireRole(Role.ADMIN), adminListOrdersHandler);
router.patch("/admin/:id/status", requireRole(Role.ADMIN), adminUpdateOrderStatusHandler);
router.post("/", createOrderHandler);
router.get("/my", myOrdersHandler);
router.get("/:id", getOrderByIdHandler);

export default router;
