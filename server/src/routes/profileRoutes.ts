import express from 'express'
import { validateMiddleware } from '../middlewares/validateMiddleware.ts';
import { changeUserpasswordSchema, updateUserSchema } from '../validations/profile.ts';
import { changeUserPassword, getUser, updateUser } from '../controllers/profileController.ts';

const router = express.Router();

router.get('/user', getUser);
router.patch('/update-user', validateMiddleware(updateUserSchema), updateUser);
router.patch('/change-password', validateMiddleware(changeUserpasswordSchema), changeUserPassword);

export default router;