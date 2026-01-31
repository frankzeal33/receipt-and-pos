import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler'
import { changeUserpasswordInput, updateUserInput } from '../types/zodtypes/profileType.ts';
import prisma from '../utils/db.ts';
import { cleanInput } from '../utils/helpers.ts';
import { hashPassword } from '../utils/hash.ts';
import bcrypt from 'bcryptjs';

export const getUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true
      },
    });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      result: user
    });

});

export const updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    
    const { firstName, lastName } = (req.validated as updateUserInput).body;

    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    const updatedUser = await prisma.user.update({
      where: { id: userId, companyId },
      data: {
        firstName: cleanInput(firstName),
        lastName: cleanInput(lastName)
      },
      select: {
        id: true,
        firstName: true,
        lastName: true
      },
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      result: updatedUser
    });

});

export const changeUserPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    
    const { oldPassword, newPassword } = (req.validated as changeUserpasswordInput).body;

    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    
    if (!isMatch) {
        res.status(400);
        throw new Error("Old password is incorrect");
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      res.status(400);
      throw new Error("New password must be different from old password");
    }

    const hashedPassword = await hashPassword(newPassword);

    const updatedUser = await prisma.user.update({
      where: { id: userId, companyId },
      data: {
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      result: updatedUser,
    });

});