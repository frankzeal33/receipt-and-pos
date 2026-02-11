import express from 'express'
import { validateMiddleware } from '../middlewares/validateMiddleware.ts';
import { paymentHistory, paystackVerifyPayment } from '../controllers/paymentController.ts';
import { paymentHistoryPaginationSchema, paystackVerifySchema } from '../validations/payment.ts';

const router = express.Router();

router.post('/paystack/verify', validateMiddleware(paystackVerifySchema), paystackVerifyPayment);
router.get('/payment-history', validateMiddleware(paymentHistoryPaginationSchema), paymentHistory);

export default router;