import express from 'express';
import { validateMiddleware } from "../middlewares/validateMiddleware.js";
import { paystackVerifyPayment } from "../controllers/paymentController.js";
import { paystackVerifySchema } from "../validations/payment.js";
const router = express.Router();
router.post('/paystack/verify', validateMiddleware(paystackVerifySchema), paystackVerifyPayment);
export default router;
