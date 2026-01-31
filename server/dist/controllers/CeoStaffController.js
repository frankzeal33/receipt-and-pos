import bcrypt from "bcryptjs";
import expressAsyncHandler from "express-async-handler";
import prisma from "../utils/db.js";
export const addStaff = expressAsyncHandler(async (req, res) => {
    const { firstName, lastName, email, role, password } = req.validated.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Check if user exists
    const userExists = await prisma.staff.findUnique({ where: { email } });
    if (userExists) {
        if (userExists.companyID === req.user.companyID) {
            res.status(400);
            throw new Error('Staff email already exists');
        }
        else {
            res.status(400);
            throw new Error('This email is not available');
        }
    }
    const newStaff = await prisma.staff.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            company: {
                connect: {
                    id_companyID: {
                        id: req.user.id || req.user.ceoId,
                        companyID: req.user.CompanyId,
                    },
                },
            },
        },
    });
    res.status(201).json({
        success: true,
        message: `New staff ${newStaff.email} added`,
        result: {
            firstName: newStaff.firstName,
            lastName: newStaff.lastName,
            email: newStaff.email,
        }
    });
});
