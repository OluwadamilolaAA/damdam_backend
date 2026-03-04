import { Router } from "express";
import { meHandler } from "../controllers/user.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/me", requireAuth, meHandler);

export default router;
