import { Router } from "express";
import { createCategoryHandler, listCategoriesHandler } from "./category.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { Role } from "../Auth/auth.model";

const router = Router();

router.get("/", listCategoriesHandler);
router.post("/", requireAuth, requireRole(Role.ADMIN), createCategoryHandler);

export default router;