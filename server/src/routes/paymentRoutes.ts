import express from 'express'
import { validateMiddleware } from '../middlewares/validateMiddleware.ts';
import { parsedInvoiceFromTextSchema } from '../validations/Ai.ts';
import { paystack } from '../controllers/paymentController.ts';

const router = express.Router();

router.post('/paystack/verify', validateMiddleware(parsedInvoiceFromTextSchema), paystack);

export default router;