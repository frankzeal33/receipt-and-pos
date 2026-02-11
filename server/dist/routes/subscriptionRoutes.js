import express from 'express';
import { downGradeToFreePlan, getSubscriptionPlan } from "../controllers/subscriptionController.js";
const router = express.Router();
router.get('/get-subscription', getSubscriptionPlan);
router.post('/downgrade-freeplan', downGradeToFreePlan);
export default router;
