import { Router } from "express";
import { createAdminHandler, meHandler } from "../User/user.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { Role } from "../modules/Auth/auth.model";

const router = Router();

router.get("/me", requireAuth, meHandler);
router.post("/create-admin", requireAuth, requireRole(Role.ADMIN), createAdminHandler);

export default router;
