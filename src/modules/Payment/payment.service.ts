import axios from "axios";
import {
  PAYSTACK_INITIALIZE_URL,
  PAYSTACK_SECRET_KEY,
  PAYSTACK_VERIFY_URL,
} from "../../config/paystack";
import { ApiError } from "../../utils/api-error";

export const initializePayment = async (
  email: string,
  amount: number,
  reference: string
) => {
  try {
    const response = await axios.post(
      PAYSTACK_INITIALIZE_URL,
      {
        email,
        amount: amount * 100, // Paystack uses kobo
        reference,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return response.data.data;
  } catch (error: any) {
    throw new ApiError(500, "Payment initialization failed");
  }
};

export const verifyPayment = async (reference: string) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_VERIFY_URL}${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return response.data.data;
  } catch (error) {
    throw new ApiError(500, "Payment verification failed");
  }
};