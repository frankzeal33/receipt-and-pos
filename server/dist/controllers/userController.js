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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Check if user exists
    const userExists = await prisma.ceo.findUnique({ where: { email } });
    if (userExists) {
        res.status(403);
        throw new Error('User already exists');
    }
    const user = await prisma.ceo.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
        },
    });
    const logID = maskIDLog(user.id);
    logger.info(`${logID} just registered`);
    // Generate OTP
    const otp = generateOtp();
    const token = generateFrontendToken();
    // Save OTP in cache for 10 minutes
    await setCache(`otp_${user.email}`, otp, 600);
    await setCache(`verify_${token}`, JSON.stringify({ token, email }), 600);
    // Prepare email
    const to = user.email;
    const subject = 'Hello from Nodemailer';
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
    const cachedOtp = await getCache(`otp_${email}`);
    if (!cachedOtp) {
        res.status(400);
        throw new Error('OTP expired or invalid');
    }
    if (cachedOtp !== otp) {
        res.status(400);
        throw new Error('Invalid OTP');
    }
    // Fetch user from DB
    const CheckUser = await prisma.ceo.findUnique({
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
    // OTP verified → delete from cache
    await delCache(`otp_${email}`);
    // Mark user as verified in DB
    const user = await prisma.ceo.update({
        where: { email },
        data: { emailVerified: true },
    });
    generateToken(res, user.id);
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
    const CheckUser = await prisma.ceo.findUnique({
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
    const user = await prisma.ceo.update({
        where: { email },
        data: { emailVerified: true },
    });
    await delCache(`verify_${token}`);
    generateToken(res, user.id);
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
        },
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
    const { email, password } = req.validated.body;
    // Find user by email
    const user = await prisma.ceo.findUnique({
        where: { email },
    });
    if (!user) {
        res.status(400);
        throw new Error("Invalid Email or Password");
    }
    // Check if email is verified
    if (!user.emailVerified) {
        res.status(403);
        throw new Error("Please verify your email to log in");
    }
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(400);
        throw new Error("Invalid Email or Password");
    }
    generateToken(res, user.id);
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
 *   put:
 *     summary: Update the logged-in CEO profile
 *     description: Allows the authenticated CEO to update their profile. Both fields are optional.
 *     tags:
 *       - [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
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
        const updatedUser = await prisma.ceo.update({
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
        res.json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        res.status(400);
        throw new Error("Profile update failed");
    }
});
export { registerUser, verifyRegOtp, verifyRegLink, loginUser, logoutUser, getUserProfile, updateUserProfile };
