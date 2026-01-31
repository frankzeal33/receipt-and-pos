import express from 'express';
import { validateMiddleware } from "../middlewares/validateMiddleware.js";
import { dashboardSummary, generateInvoiceReminderEmail, parseInvoiceFromText } from "../controllers/AiController.js";
import { invoiceEmailReminderSchema, parsedInvoiceFromTextSchema } from "../validations/Ai.js";
const router = express.Router();
router.post('/parse-text', validateMiddleware(parsedInvoiceFromTextSchema), parseInvoiceFromText);
router.post('/invoice/generate-reminder/:invoiceId', validateMiddleware(invoiceEmailReminderSchema), generateInvoiceReminderEmail);
router.get('/dashboard-summary', dashboardSummary);
export default router;
