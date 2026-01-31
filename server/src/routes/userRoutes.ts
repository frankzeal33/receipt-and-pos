import express from 'express'
import {registerUser, loginUser, logoutUser, getUserProfile, updateUserProfile, verifyRegOtp, verifyRegLink, forgotPassword, verifyForgotPasswordOtp, verifyForgotPasswordLink, resendRegVerificationEmail, resetPassword} from '../controllers/userController.ts'
import { validateMiddleware } from '../middlewares/validateMiddleware.ts';
import { forgotPasswordSchema, loginSchema, registerSchema, resendRegVerificationSchema, resetPasswordSchema, updateSchema, verifyRegLinkSchema, verifyRegSchema } from '../validations/Auth.ts';
import { rateLimitByField } from '../middlewares/rateLimiterMiddleware.ts';
import { protectAll, protectCEO } from '../middlewares/authMiddleware.ts';

const router = express.Router();

router.post('/register', rateLimitByField("email", 5, 600), validateMiddleware(registerSchema), registerUser);
router.post('/register/verify-otp', validateMiddleware(verifyRegSchema), verifyRegOtp);
router.get('/register/verify', validateMiddleware(verifyRegLinkSchema), verifyRegLink);
router.post('/register/resend-otp', validateMiddleware(resendRegVerificationSchema), resendRegVerificationEmail);
router.post('/forgot-password', validateMiddleware(forgotPasswordSchema), forgotPassword);
router.post('/forgot-password/verify-otp', validateMiddleware(verifyRegSchema), verifyForgotPasswordOtp);
router.get('/forgot-password/verify', validateMiddleware(verifyRegLinkSchema), verifyForgotPasswordLink);
router.post('/forgot-password/reset', validateMiddleware(resetPasswordSchema), resetPassword);
router.post('/login', validateMiddleware(loginSchema), loginUser);
router.post('/logout', logoutUser);
router.route('/profile').get(protectAll, getUserProfile).patch(protectAll, protectCEO, validateMiddleware(updateSchema), updateUserProfile);



export default router;