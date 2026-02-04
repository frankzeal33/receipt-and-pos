import express from 'express'
import { validateMiddleware } from '../middlewares/validateMiddleware.ts';
import { paystackVerifyPayment } from '../controllers/paymentController.ts';
import { paystackVerifySchema } from '../validations/payment.ts';

const router = express.Router();

router.post('/paystack/verify', validateMiddleware(paystackVerifySchema), paystackVerifyPayment);

export default router;