import express from 'express';
import { validateMiddleware } from "../middlewares/validateMiddleware.js";
import { parsedInvoiceFromTextSchema } from "../validations/Ai.js";
import { paystack } from "../controllers/paymentController.js";
const router = express.Router();
router.post('/paystack/verify', validateMiddleware(parsedInvoiceFromTextSchema), paystack);
export default router;
