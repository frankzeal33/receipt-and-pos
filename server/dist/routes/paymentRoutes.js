import express from 'express';
import { validateMiddleware } from "../middlewares/validateMiddleware.js";
import { paymentHistory, paystackVerifyPayment } from "../controllers/paymentController.js";
import { paymentHistoryPaginationSchema, paystackVerifySchema } from "../validations/payment.js";
const router = express.Router();
router.post('/paystack/verify', validateMiddleware(paystackVerifySchema), paystackVerifyPayment);
router.get('/payment-history', validateMiddleware(paymentHistoryPaginationSchema), paymentHistory);
export default router;
