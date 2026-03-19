import { Request, Response } from "express";
import crypto from "crypto";
import { PAYSTACK_SECRET_KEY } from "../../config/paystack";
import OrderModel, { OrderStatus, PaymentStatus } from "../Order/order.model";
import { asyncHandler } from "../../utils/async-handler";

// 🔧 TEMP verifyPayment (replace later)
const verifyPayment = async (reference: string) => {
  return {
    status: "success",
    reference,
  };
};

export const paystackWebhook = asyncHandler(async (req: Request, res: Response) => {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(400).send("Invalid signature");
  }

  const event = req.body;

  if (event.event === "charge.success") {
    const reference = event.data.reference;

    const order = await OrderModel.findOne({ paymentId: reference });

    if (!order) return res.sendStatus(200);

    order.paymentStatus = PaymentStatus.PAID; 
    order.status = OrderStatus.CONFIRMED;     
    await order.save();
  }

  res.sendStatus(200);
});

export const verifyPaymentHandler = asyncHandler(async (req: Request, res: Response) => {
  const reference = req.params.reference as string;

  const payment = await verifyPayment(reference);

  if (payment.status !== "success") {
    return res.status(400).json({ message: "Payment not successful" });
  }

  const order = await OrderModel.findOne({ paymentId: reference });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.paymentStatus = PaymentStatus.PAID; 
  order.status = OrderStatus.CONFIRMED;     
  await order.save();

  res.status(200).json({ message: "Payment verified", order });
});