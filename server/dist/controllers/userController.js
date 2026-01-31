import asyncHandler from 'express-async-handler';
import prisma from "../utils/db.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/emailTransporter.js";
import { renderTemplate } from "../utils/renderTemplate.js";
import { delCache, getCache, setCache } from "../utils/cacheInstance.js";
import logger from "../utils/logger.js";
import { maskIDLog } from "../utils/masks.js";
import { generateFrontendToken, generateOtp } from "../utils/randomTokens.js";
import { clearAuthCookies } from "../utils/clearCookies.js";
import { cleanInput } from "../utils/helpers.js";
import { hashPassword } from "../utils/hash.js";
/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new CEO
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongP@ssw0rd
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: johndoe@example.com registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 64f8c0b2c4f1a23456789abc
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *       400:
 *         description: Bad request or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User already exists
 */
const registerUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.validated.body;
    const hashedPassword = await hashPassword(password);
    const userEmail = email.toLowerCase();
    // Check if user exists
    const userExists = await prisma.user.findUnique({ where: { email: userEmail } });
    if (userExists) {
        res.status(403);
        throw new Error('User already exists, Please login');
    }
    // Run everything in a single transaction
    const user = await prisma.$transaction(async (tx) => {
        // Create company
        const company = await tx.company.create({
            data: {
                name: null
            },
        });
        // Auto-create Head Office branch
        const headOffice = await tx.branch.create({
            data: {
                name: "Head Office",
                location: null,
                companyId: company.id,
            },
        });
        // Create CEO user (branchId = null)
        const newUser = await tx.user.create({
            data: {
                firstName,
                lastName,
                email: userEmail,
                password: hashedPassword,
                role: "CEO",
                companyId: company.id,
                branchId: null,
            },
        });
        // Insert CEO notification
        await tx.userNotification.create({
            data: {
                role: newUser.role,
                userId: newUser.id,
                companyId: newUser.companyId,
                branchId: newUser.branchId,
            },
        });
        return newUser;
    });
    const logID = maskIDLog(user.id);
    logger.info(`${logID} just registered`);
    // Generate OTP
    const otp = generateOtp();
    const token = generateFrontendToken();
    // Save OTP in cache for 30 minutes
    await setCache(`otp_${user.email}`, otp, 1800);
    await setCache(`verify_${token}`, JSON.stringify({ token, email: user.email }), 1800);
    // Prepare email
    const to = user.email;
    const subject = 'Ripe - Verify your email';
    const htmlContent = renderTemplate('registerOTP', {
        firstname: firstName,
        lastname: lastName,
        otp,
        link: `${process.env.FRONTEND_URL}/register/verify?token=${token}`
    });
    try {
        const sendOTP = await sendEmail(to, subject, htmlContent);
        // Attach message to res.locals for audit logging
        const message = `Registration OTP sent to ${logID}`;
        res.locals.message = message;
        res.status(201).json({
            success: true,
            message: `OTP sent to ${user.email}`,
            result: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            }
        });
    }
    catch (err) {
        throw new Error('Failed to send verification email');
    }
});
/**
 * @swagger
 * /users/register/verify-otp:
 *   post:
 *     summary: Verify CEO registration OTP
 *     description: Verifies a user's email by checking the OTP sent during registration.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 12345
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *       400:
 *         description: Invalid or expired OTP / Email already verified
 *       404:
 *         description: User not found
 */
const verifyRegOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.validated.body;
    const userEmail = email.toLowerCase();
    const cachedOtp = await getCache(`otp_${userEmail}`);
    if (!cachedOtp) {
        res.status(400);
        throw new Error('OTP expired or invalid');
    }
    if (cachedOtp !== otp) {
        res.status(400);
        throw new Error('Invalid OTP');
    }
    // Fetch user from DB
    const CheckUser = await prisma.user.findUnique({
        where: { email: userEmail },
    });
    if (!CheckUser) {
        res.status(404);
        throw new Error("User not found");
    }
    // Check if already verified
    if (CheckUser.emailVerified) {
        res.status(403);
        throw new Error("Email already verified, Please Login");
    }
    // OTP verified → delete from cache
    await delCache(`otp_${userEmail}`);
    // Mark user as verified in DB
    const user = await prisma.user.update({
        where: { email: userEmail },
        data: { emailVerified: true },
    });
    const signData = { userId: user.id, companyId: user.companyId };
    generateToken(res, signData);
    const logID = maskIDLog(user.id);
    const message = `${logID} just verified his email with OTP`;
    logger.info(message);
    res.locals.message = message;
    res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        result: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        },
    });
});
/**
 * @swagger
 * /users/register/verify:
 *   get:
 *     summary: Verify CEO registration via email link
 *     description: Verifies a user's email using a token from a verification link.
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique verification token sent to the user's email
 *         example: "deb0154866f938fc7c5798c953f12dfed40445a85a0f"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 12345
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *       400:
 *         description: Invalid or expired token / Email already verified
 *       404:
 *         description: User not found
 */
const verifyRegLink = asyncHandler(async (req, res) => {
    const { token } = req.validated.query;
    const cached = await getCache(`verify_${token}`);
    ;
    if (!cached) {
        res.status(400);
        throw new Error("Token expired or invalid");
    }
    const parsed = JSON.parse(cached);
    if (parsed.token !== token) {
        res.status(400);
        throw new Error("Invalid token");
    }
    const email = parsed.email;
    // Fetch user from DB
    const CheckUser = await prisma.user.findUnique({
        where: { email },
    });
    if (!CheckUser) {
        res.status(404);
        throw new Error("User not found");
    }
    // Check if already verified
    if (CheckUser.emailVerified) {
        res.status(400);
        throw new Error("Email already verified, Please Login");
    }
    // Mark user as verified in DB
    const user = await prisma.user.update({
        where: { email },
        data: { emailVerified: true },
    });
    await delCache(`verify_${token}`);
    const signData = { userId: user.id, companyId: user.companyId };
    generateToken(res, signData);
    const logID = maskIDLog(user.id);
    const message = `${logID} just verified his email with link`;
    logger.info(message);
    res.locals.message = message;
    res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        result: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        },
    });
});
const resendRegVerificationEmail = asyncHandler(async (req, res) => {
    const { email } = req.validated.body;
    const userEmail = email.toLowerCase();
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { email: userEmail },
    });
    if (!user) {
        res.status(404);
        throw new Error("User not found, please register first");
    }
    // Optional: if user already verified, block resend
    if (user.emailVerified) {
        res.status(403);
        throw new Error("Email already verified, Please Login");
    }
    let cachedotp = await getCache(`otp_${user.email}`);
    if (cachedotp) {
        res.status(400);
        throw new Error("Former OTP sent is still active, Try again later");
    }
    // Generate new OTP + token
    const otp = generateOtp();
    const token = generateFrontendToken();
    // Save OTP in cache for 30 minutes
    await setCache(`otp_${user.email}`, otp, 1800);
    await setCache(`verify_${token}`, JSON.stringify({ token, email: user.email }), 1800);
    // Prepare email
    const to = user.email;
    const subject = "Resend OTP - Verify your account";
    const htmlContent = renderTemplate("registerOTP", {
        firstname: user.firstName,
        lastname: user.lastName,
        otp,
        link: `${process.env.FRONTEND_URL}/register/verify?token=${token}`,
    });
    try {
        await sendEmail(to, subject, htmlContent);
        const logID = maskIDLog(user.id);
        const message = `Resend OTP sent to ${logID}`;
        res.locals.message = message;
        res.status(200).json({
            success: true,
            message: `OTP resent to ${user.email}`,
            result: {
                email: user.email
            }
        });
    }
    catch (err) {
        throw new Error("Failed to resend verification email");
    }
});
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.validated.body;
    const userEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    const otp = generateOtp();
    const token = generateFrontendToken();
    await setCache(`otp_${user.email}`, otp, 600);
    await setCache(`verify_${token}`, JSON.stringify({ token, email: user.email }), 600);
    // Prepare email
    const subject = "Password Reset OTP";
    const htmlContent = renderTemplate("resetPasswordOTP", {
        firstname: user.firstName,
        lastname: user.lastName,
        otp,
        link: `${process.env.FRONTEND_URL}/reset-password/verify?token=${token}`,
    });
    try {
        await sendEmail(user.email, subject, htmlContent);
        // For audit logging
        res.locals.message = `Password reset OTP sent to ${user.email}`;
        // Respond once
        res.status(200).json({
            success: true,
            message: `OTP sent to ${user.email}`,
            result: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
        });
    }
    catch (err) {
        res.status(500);
        throw new Error("Failed to send verification email");
    }
});
const verifyForgotPasswordOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.validated.body;
    const userEmail = email.toLowerCase();
    // Get OTP from cache
    const cachedOtp = await getCache(`otp_${userEmail}`);
    if (!cachedOtp) {
        res.status(400);
        throw new Error("OTP expired or not found");
    }
    if (cachedOtp !== otp) {
        res.status(400);
        throw new Error("Invalid OTP");
    }
    // OTP is valid → issue temporary reset token
    const resetToken = generateFrontendToken();
    await setCache(`reset_${resetToken}`, userEmail, 300);
    res.status(200).json({
        success: true,
        message: "OTP verified successfully",
        result: {
            resetToken
        }
    });
});
const verifyForgotPasswordLink = asyncHandler(async (req, res) => {
    const { token } = req.validated.query;
    // Lookup token in cache
    const cachedData = await getCache(`verify_${token}`);
    if (!cachedData) {
        res.status(400);
        throw new Error("This link is no longer valid, Please go back and try again");
    }
    const { email } = JSON.parse(cachedData);
    // Token is valid → issue temporary reset token
    const resetToken = generateFrontendToken();
    await setCache(`reset_${resetToken}`, email, 300); // valid 5 minutes
    res.status(200).json({
        success: true,
        message: "Link verified successfully",
        result: {
            resetToken
        }
    });
});
const resetPassword = asyncHandler(async (req, res) => {
    const { resetToken, newPassword } = req.validated.body;
    // Lookup reset token in cache
    const email = await getCache(`reset_${resetToken}`);
    if (!email) {
        res.status(400);
        throw new Error("Invalid token, Please go back and try again");
    }
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
    });
    // Clear token
    await delCache(`reset_${resetToken}`);
    res.status(200).json({
        success: true,
        message: "Password reset successfully",
    });
});
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a CEO
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPassword123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login Successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 12345
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: johndoe@example.com
 *       400:
 *         description: Invalid email or password
 *       403:
 *         description: Email not verified
 *       500:
 *         description: Internal server error
 */
const loginUser = asyncHandler(async (req, res) => {
    const { email, password, rememberMe } = req.validated.body;
    const userEmail = email.toLowerCase();
    // Check CEO first
    let user = await prisma.user.findUnique({
        where: { email: userEmail },
    });
    if (!user) {
        res.status(400);
        throw new Error("Invalid Email or Password");
    }
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(400);
        throw new Error("Invalid Email or Password");
    }
    // Check if ceo email is verified
    if (user.role === "CEO" && !user.emailVerified) {
        res.status(403);
        throw new Error("Please verify your email to log in");
    }
    const signData = { userId: user.id, companyId: user.companyId };
    generateToken(res, signData, rememberMe);
    const logID = maskIDLog(user.id);
    const message = `${logID} just Logged In`;
    logger.info(message);
    res.locals.message = message;
    res.status(200).json({
        success: true,
        message: 'Login Successful',
        result: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        },
    });
});
/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout CEO
 *     description: Clears the access and refresh tokens from cookies and logs the user out.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: logged out successfully
 *       500:
 *         description: Internal server error
 */
const logoutUser = asyncHandler(async (req, res) => {
    clearAuthCookies(res);
    res.status(200).json({ message: 'logged out successfully' });
});
/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get the logged-in CEO profile
 *     description: Returns the profile details of the authenticated CEO user.
 *     tags:
 *       - [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile fetched successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "f3b6a7d2-12a4-4c89-bbe5-8a7d7b6cba11"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "john@example.com"
 *                     role:
 *                       type: string
 *                       example: "CEO"
 *       401:
 *         description: Unauthorized (no token or invalid token)
 *       500:
 *         description: Internal Server Error
 */
const getUserProfile = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        message: "Profile fetched successfully",
        result: {
            ...req.user
        }
    });
});
/**
 * @swagger
 * /users/profile:
 *   patch:
 *     summary: Update the logged-in CEO profile
 *     description: Allows the authenticated CEO to update their profile. Both fields are optional.
 *     tags:
 *       - [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *             additionalProperties: false
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *       400:
 *         description: Profile update failed
 *       401:
 *         description: Unauthorized (not logged in or invalid token)
 *       500:
 *         description: Internal Server Error
 */
const updateUserProfile = asyncHandler(async (req, res) => {
    const { firstName, lastName } = req.validated.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                firstName: cleanInput(firstName),
                lastName: cleanInput(lastName),
            },
            select: {
                firstName: true,
                lastName: true,
            },
        });
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            result: updatedUser,
        });
    }
    catch (error) {
        res.status(400);
        throw new Error("Profile update failed");
    }
});
export { registerUser, verifyRegOtp, verifyRegLink, resendRegVerificationEmail, forgotPassword, verifyForgotPasswordOtp, verifyForgotPasswordLink, resetPassword, loginUser, logoutUser, getUserProfile, updateUserProfile };
