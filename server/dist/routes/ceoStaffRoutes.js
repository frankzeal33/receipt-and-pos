import express from 'express';
import { validateMiddleware } from "../middlewares/validateMiddleware.js";
import { addStaffSchema } from "../validations/Staff.js";
import { addStaff } from "../controllers/CeoStaffController.js";
const router = express.Router();
router.post('/add-staff', validateMiddleware(addStaffSchema), addStaff);
export default router;
