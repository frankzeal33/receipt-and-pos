import express from 'express'
import {registerUser, loginUser, logoutUser, getUserProfile, updateUserProfile, verifyRegOtp, verifyRegLink} from '../controllers/userController.ts'
import { validateMiddleware } from '../middlewares/validateMiddleware.ts';
import { loginSchema, registerSchema, updateSchema, verifyRegLinkSchema, verifyRegSchema } from '../validations/Auth.ts';
import { rateLimitByField } from '../middlewares/rateLimiterMiddleware.ts';
import { protectCEO } from '../middlewares/authMiddleware.ts';

const router = express.Router();

router.post('/register', rateLimitByField("email", 5, 600), validateMiddleware(registerSchema), registerUser);
router.post('/register/verify-otp', validateMiddleware(verifyRegSchema), verifyRegOtp);
router.get('/register/verify', validateMiddleware(verifyRegLinkSchema), verifyRegLink);
router.post('/login', validateMiddleware(loginSchema), loginUser);
router.post('/logout', logoutUser);
router.route('/profile').get(protectCEO, getUserProfile).patch(protectCEO, validateMiddleware(updateSchema), updateUserProfile);



export default router;