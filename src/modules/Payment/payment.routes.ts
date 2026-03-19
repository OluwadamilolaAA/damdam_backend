import { Router } from "express";
import { paystackWebhook, verifyPaymentHandler } from "./payment.controller";

const router = Router();

router.post("/webhook/paystack", paystackWebhook);
router.get("/verify/:reference", verifyPaymentHandler);

export default router;