import express from 'express'
import { validateMiddleware } from '../middlewares/validateMiddleware.ts';
import { dashboardSummary, generateInvoiceReminderEmail, parseInvoiceFromText } from '../controllers/AiController.ts';
import { invoiceEmailReminderSchema, parsedInvoiceFromTextSchema } from '../validations/Ai.ts';

const router = express.Router();

router.post('/parse-text', validateMiddleware(parsedInvoiceFromTextSchema), parseInvoiceFromText);
router.post('/invoice/generate-reminder/:invoiceId', validateMiddleware(invoiceEmailReminderSchema), generateInvoiceReminderEmail);

router.get('/dashboard-summary', dashboardSummary);

export default router;