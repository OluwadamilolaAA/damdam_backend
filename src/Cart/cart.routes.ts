import { Router } from "express";
import {
  addCartItemHandler,
  clearCartHandler,
  getMyCartHandler,
  removeCartItemHandler,
  updateCartItemHandler,
} from "./cart.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", getMyCartHandler);
router.post("/items", addCartItemHandler);
router.patch("/items/:productId", updateCartItemHandler);
router.delete("/items/:productId", removeCartItemHandler);
router.delete("/clear", clearCartHandler);

export default router;
