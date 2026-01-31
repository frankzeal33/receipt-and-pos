import express from 'express';
import { validateMiddleware } from "../middlewares/validateMiddleware.js";
import { changeUserpasswordSchema, updateUserSchema } from "../validations/profile.js";
import { changeUserPassword, getUser, updateUser } from "../controllers/profileController.js";
const router = express.Router();
router.get('/user', getUser);
router.patch('/update-user', validateMiddleware(updateUserSchema), updateUser);
router.patch('/change-password', validateMiddleware(changeUserpasswordSchema), changeUserPassword);
export default router;
