import { Router } from "express";
import {
  createProductHandler,
  deleteProductHandler,
  getProductByIdHandler,
  listAllProductsAdminHandler,
  listProductsHandler,
  updateProductHandler,
} from "../controllers/product.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { Role } from "../models/user.model";

const router = Router();

router.get("/admin/all", requireAuth, requireRole(Role.ADMIN), listAllProductsAdminHandler);
router.get("/", listProductsHandler);
router.get("/:id", getProductByIdHandler);

router.post("/", requireAuth, requireRole(Role.ADMIN), createProductHandler);
router.patch("/:id", requireAuth, requireRole(Role.ADMIN), updateProductHandler);
router.delete("/:id", requireAuth, requireRole(Role.ADMIN), deleteProductHandler);

export default router;
