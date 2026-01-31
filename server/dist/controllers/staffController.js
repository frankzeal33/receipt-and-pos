import expressAsyncHandler from "express-async-handler";
import prisma from "../utils/db.js";
import { hashPassword } from "../utils/hash.js";
import { cleanInput } from "../utils/helpers.js";
import { AllRole } from "@prisma/client";
import { ManagerPermissions } from "../utils/permissions/Manager.js";
export const addStaff = expressAsyncHandler(async (req, res) => {
    const { firstName, lastName, email, role, password, branchId } = req.validated.body;
    const staffEmail = email.toLowerCase();
    const staffExists = await prisma.user.findUnique({ where: { email: staffEmail } });
    const hashedPassword = await hashPassword(password);
    if (staffExists) {
        if (staffExists.companyId === req.user.companyId) {
            res.status(400);
            throw new Error('email already exists in this company');
        }
        else {
            res.status(400);
            throw new Error('This email is not available');
        }
    }
    if (req.user.role === AllRole.MANAGER) {
        // MANAGER can only add SALES_PERSON or ACCOUNTANT
        const allowedRoles = [AllRole.SALES_PERSON, AllRole.ACCOUNTANT];
        if (!role || !allowedRoles.includes(role)) {
            res.status(400);
            throw new Error("Manager can only add a Sales Person or Accountant");
        }
        ManagerPermissions(req.user, { branchId: branchId ?? null }, res);
    }
    let branch;
    const topRoles = [AllRole.CO_CEO, AllRole.GENERAL_MANAGER, AllRole.GENERAL_ACCOUNTANT];
    if (topRoles.includes(role)) {
        branch = null; // top-level roles, no branch
    }
    else {
        if (!branchId) {
            throw new Error(`Branch is required for role ${role}`);
        }
        branch = branchId; // all other roles must have a branch
    }
    // Run everything in a single transaction
    const result = await prisma.$transaction(async (tx) => {
        const newStaff = await tx.user.create({
            data: {
                firstName,
                lastName,
                email: staffEmail,
                password: hashedPassword,
                role,
                companyId: req.user.companyId,
                branchId: branch
            },
            include: {
                branch: {
                    select: { name: true },
                },
            },
        });
        // Create notification
        const addNotification = await tx.notification.create({
            data: {
                title: `${req.user.email} (${req.user.role}${req.user.branch ? " - " + req.user.branch.name : ""}) added a staff`,
                description: `A staff ${newStaff.email} with ${newStaff.role} role was added by a ${req.user.role} ${newStaff.branch ? `in branch ${newStaff.branch.name}` : ""}`,
                type: "USER",
                companyId: req.user.companyId,
                branchId: req.user.branchId || null,
                userId: req.user.id,
                role: req.user.role
            },
        });
        // Fetch all staff in that company
        // const staffList = await tx.staff.findMany({
        //     where: { companyId: req.user.companyId },
        //     select: { id: true, role: true },
        // });
        // Insert Staff notification
        await tx.userNotification.create({
            data: {
                role: newStaff.role,
                userId: newStaff.id,
                companyId: req.user.companyId,
                branchId: newStaff.branchId
            },
        });
        await tx.userNotification.updateMany({
            where: { companyId: req.user.companyId },
            data: { readAll: false }, // same update for all
        });
        // // Insert staff notifications (bulk)
        // await tx.userNotification.createMany({
        //     data: staffList.map((s) => ({
        //         role: s.role,
        //         userID: s.id,
        //         companyId: req.user.companyId
        //     })),
        // });
        return newStaff;
    });
    // Transaction succeeded
    res.status(201).json({
        success: true,
        message: `New staff ${result.email} added`,
        result: {
            firstName: result.firstName,
            lastName: result.lastName,
            email: result.email,
        },
    });
});
export const editStaff = expressAsyncHandler(async (req, res) => {
    const { staffId, firstName, lastName, role, status } = req.validated.body;
    const dataToUpdate = {};
    if (firstName)
        dataToUpdate.firstName = firstName;
    if (lastName)
        dataToUpdate.lastName = lastName;
    if (role)
        dataToUpdate.role = role;
    if (status)
        dataToUpdate.status = status;
    const staffIdExists = await prisma.user.findFirst({ where: { id: staffId, companyId: req.user.companyId } });
    if (!staffIdExists) {
        res.status(404);
        throw new Error('This staff does not exist in your company');
    }
    if (req.user.role === AllRole.MANAGER) {
        // MANAGER can only add SALES_PERSON or ACCOUNTANT
        const allowedRoles = [AllRole.SALES_PERSON, AllRole.ACCOUNTANT];
        if (!role || !allowedRoles.includes(role)) {
            res.status(400);
            throw new Error("Manager can only add a Sales Person or Accountant");
        }
        ManagerPermissions(req.user, staffIdExists, res, true);
    }
    const updatedStaff = await prisma.user.update({
        where: { id: staffId, companyId: req.user.companyId },
        data: dataToUpdate,
    });
    res.status(200).json({
        success: true,
        message: `Staff ${updatedStaff.email} updated successfully`,
        result: {
            firstName: updatedStaff.firstName,
            lastName: updatedStaff.lastName,
            email: updatedStaff.email,
        },
    });
});
export const deleteStaff = expressAsyncHandler(async (req, res) => {
    const { staffId } = req.validated.params;
    const staffIdExists = await prisma.user.findFirst({ where: { id: staffId, companyId: req.user.companyId } });
    if (!staffIdExists) {
        res.status(404);
        throw new Error('This staff does not exist in your company');
    }
    if ((staffIdExists.id === req.user.id) && (req.user.role !== AllRole.CEO)) {
        res.status(403);
        throw new Error('You cannot delete yourself');
    }
    if (req.user.role === AllRole.MANAGER) {
        ManagerPermissions(req.user, staffIdExists, res, true);
    }
    const deleteStaff = await prisma.user.delete({
        where: { id: staffId, companyId: req.user.companyId },
    });
    res.status(200).json({
        success: true,
        message: `Staff "${deleteStaff.email}" deleted successfully`,
    });
});
export const addProduct = expressAsyncHandler(async (req, res) => {
    const { productName, productDesc, category, brand, price, quantity, status, branchId } = req.validated.body;
    const product_name = productName.toLowerCase();
    const nameAlreadyExists = await prisma.product.findFirst({
        where: { productName: product_name, companyId: req.user.companyId }
    });
    if (nameAlreadyExists) {
        res.status(400);
        throw new Error("Exact product name already exists, add another word to it, to differenciate each product");
    }
    if (branchId) {
        const branchExists = await prisma.branch.findFirst({
            where: { id: branchId, companyId: req.user.companyId },
        });
        if (!branchExists) {
            res.status(400);
            throw new Error("branch not found");
        }
    }
    if (req.user.role === AllRole.MANAGER) {
        ManagerPermissions(req.user, { branchId: branchId ?? null }, res);
    }
    const product = await prisma.product.create({
        data: {
            productName: product_name,
            productDesc: productDesc || null,
            category: category || "uncategorized",
            brand: brand || "uncategorized",
            price,
            quantity,
            status,
            companyId: req.user.companyId,
            branchId: branchId || null,
            addedBy: req.user.email,
            role: req.user.role,
            currentlyEditedBy: req.user.email,
            editedRole: req.user.role
        },
    });
    res.status(201).json({
        success: true,
        message: `Product added successfully`,
    });
});
export const editProduct = expressAsyncHandler(async (req, res) => {
    const { productId, productName, productDesc, category, brand, price, quantity, status, branchId } = req.validated.body;
    const result = await prisma.$transaction(async (tx) => {
        const product = await tx.product.findFirst({
            where: { id: productId, companyId: req.user.companyId },
        });
        if (!product) {
            res.status(404);
            throw new Error("Product not found for this company");
        }
        if (branchId) {
            const branchExists = await tx.branch.findFirst({
                where: { id: branchId, companyId: req.user.companyId },
            });
            if (!branchExists) {
                res.status(400);
                throw new Error("branch not found");
            }
        }
        if (req.user.role === AllRole.MANAGER) {
            ManagerPermissions(req.user, { branchId: branchId ?? null }, res);
        }
        const updateProduct = await tx.product.update({
            where: { id: productId, companyId: req.user.companyId },
            data: {
                productName: cleanInput(productName),
                productDesc: cleanInput(productDesc),
                category: cleanInput(category),
                brand: cleanInput(brand),
                price: cleanInput(price),
                quantity: cleanInput(quantity),
                status: cleanInput(status),
                branchId: cleanInput(branchId),
                currentlyEditedBy: req.user.email,
                editedRole: req.user.role
            },
            include: {
                branch: {
                    select: { name: true }
                }
            }
        });
        // Create notification
        const addNotification = await tx.notification.create({
            data: {
                title: `${req.user.email} (${req.user.role}${req.user.branch ? " - " + req.user.branch.name : ""}) edited a product`,
                description: `Updated Product info: #Name-${updateProduct.productName} #Price-${updateProduct.price} #Quantity-${updateProduct.quantity} #Status-${updateProduct.status} ${updateProduct.branch ? `in branch ${updateProduct.branch.name}` : ""}`,
                type: "PRODUCT",
                companyId: req.user.companyId,
                branchId: req.user.branchId || null,
                userId: req.user.id,
                role: req.user.role
            },
        });
        await tx.userNotification.updateMany({
            where: { companyId: req.user.companyId },
            data: { readAll: false },
        });
        return updateProduct;
    });
    res.status(200).json({
        success: true,
        message: `Product edited successfully`,
    });
});
export const deleteProduct = expressAsyncHandler(async (req, res) => {
    const { productId } = req.validated.params;
    const product = await prisma.product.findFirst({
        where: { id: productId, companyId: req.user.companyId },
    });
    if (!product) {
        res.status(404);
        throw new Error("Product not found for this company");
    }
    if (req.user.role === AllRole.MANAGER) {
        ManagerPermissions(req.user, { branchId: product.branchId ?? null }, res);
    }
    const result = await prisma.$transaction(async (tx) => {
        const deleteProduct = await tx.product.delete({
            where: { id: productId, companyId: req.user.companyId },
            include: {
                branch: {
                    select: { name: true }
                }
            }
        });
        // Create notification
        const addNotification = await tx.notification.create({
            data: {
                title: `${req.user.email} (${req.user.role}${req.user.branch ? " - " + req.user.branch.name : ""}) deleted a product`,
                description: `Product info: #Name-${deleteProduct.productName} #Price-${deleteProduct.price} #Quantity-${deleteProduct.quantity} #Status-${deleteProduct.status} ${deleteProduct.branch ? `in branch ${deleteProduct.branch.name}` : ""}`,
                type: "PRODUCT",
                companyId: req.user.companyId,
                branchId: req.user.branchId || null,
                userId: req.user.id,
                role: req.user.role
            },
        });
        await tx.userNotification.updateMany({
            where: { companyId: req.user.companyId },
            data: { readAll: false },
        });
        return deleteProduct;
    });
    res.status(200).json({
        success: true,
        message: `Product "${result.productName}" deleted successfully`,
    });
});
export const addExpense = expressAsyncHandler(async (req, res) => {
    const { title, description, category, amount, paymentType, expenseDate } = req.validated.body;
    const expense = await prisma.expense.create({
        data: {
            title,
            description: cleanInput(description),
            category,
            amount,
            paymentType,
            expenseDate: expenseDate || new Date(),
            companyId: req.user.companyId,
            branchId: req.user.branchId || null,
            recordedByEmail: req.user.email,
            recordedByRole: req.user.role
        },
    });
    res.status(201).json({
        success: true,
        message: "Expense recorded successfully",
        result: expense,
    });
});
export const editExpense = expressAsyncHandler(async (req, res) => {
    const { branchId, title, description, category, amount, paymentType, expenseDate } = req.validated.body;
    const { expenseId } = req.validated.params;
    if (branchId) {
        const branchExists = await prisma.branch.findFirst({
            where: { id: branchId, companyId: req.user.companyId },
        });
        if (!branchExists) {
            res.status(400);
            throw new Error("branch not found");
        }
    }
    if (req.user.role === AllRole.MANAGER) {
        ManagerPermissions(req.user, { branchId: branchId ?? null }, res);
    }
    const expense = await prisma.expense.update({
        where: { id: expenseId, companyId: req.user.companyId },
        data: {
            title: cleanInput(title),
            description: cleanInput(description),
            category: cleanInput(category),
            amount: cleanInput(amount),
            paymentType: cleanInput(paymentType),
            expenseDate: cleanInput(expenseDate),
            updatedByEmail: req.user.email,
            updatedByRole: req.user.role
        },
    });
    res.status(201).json({
        success: true,
        message: "Expense updated successfully",
        result: expense,
    });
});
export const deleteExpense = expressAsyncHandler(async (req, res) => {
    const { branchId } = req.validated.body;
    const { expenseId } = req.validated.params;
    if (branchId) {
        const branchExists = await prisma.branch.findFirst({
            where: { id: branchId, companyId: req.user.companyId },
        });
        if (!branchExists) {
            res.status(400);
            throw new Error("branch not found");
        }
    }
    if (req.user.role === AllRole.MANAGER) {
        ManagerPermissions(req.user, { branchId: branchId ?? null }, res);
    }
    const result = await prisma.$transaction(async (tx) => {
        const deletedExpense = await tx.expense.delete({
            where: {
                id: expenseId,
                companyId: req.user.companyId,
            },
            include: {
                branch: {
                    select: { name: true }
                }
            }
        });
        // Create notification
        const addNotification = await tx.notification.create({
            data: {
                title: `${req.user.email} (${req.user.role}${req.user.branch ? " - " + req.user.branch.name : ""}) deleted an expense`,
                description: `Expense info: #Title-${deletedExpense.title} #Desc-${deletedExpense.description} #Category-${deletedExpense.category} #Amount-${deletedExpense.amount} #PaymentType-${deletedExpense.paymentType} #ExpenseDate-${deletedExpense.expenseDate} ${deletedExpense.branch ? `in branch ${deletedExpense.branch.name}` : ""}`,
                type: "EXPENSE",
                companyId: req.user.companyId,
                branchId: req.user.branchId,
                userId: req.user.id,
                role: req.user.role
            },
        });
        await tx.userNotification.updateMany({
            where: { companyId: req.user.companyId },
            data: { readAll: false },
        });
        return deletedExpense;
    });
    res.status(200).json({
        success: true,
        message: `Expense "${result.title}" deleted successfully`,
    });
});
export const addInvoice = expressAsyncHandler(async (req, res) => {
    const { invoiceName, totalAmount, extraCharge = 0, extraChargeName, paymentTerm, discount = 0, discountName, status, totalTaxAmount, date, dueDate, businessName, email, phone, address, customerName, customerEmail, customerAddress, customerPhone, invoiceItems, currency, note, branchId } = req.validated.body;
    const companyId = req.user.companyId;
    const addedBy = req.user.email;
    const addedByRole = req.user.role;
    if (branchId) {
        const branchExists = await prisma.branch.findFirst({
            where: { id: branchId, companyId: req.user.companyId },
        });
        if (!branchExists) {
            res.status(400);
            throw new Error("branch not found");
        }
    }
    if (req.user.role === AllRole.MANAGER) {
        ManagerPermissions(req.user, { branchId: branchId ?? null }, res);
    }
    // Backend calculation
    const subtotal = invoiceItems.reduce((acc, item) => {
        const quantity = Number(item.itemQuantity) || 0;
        const amount = Number(item.itemAmount) || 0;
        const tax = Number(item.tax) || 0;
        // Base total for the item
        const itemBaseTotal = quantity * amount;
        // Add tax
        const itemTotal = itemBaseTotal + (itemBaseTotal * tax) / 100;
        // Validation (optional)
        if (Number(item.itemTotal) !== itemTotal) {
            res.status(400);
            throw new Error(`Item total mismatch for "${item.itemTitle}"`);
        }
        return acc + itemTotal;
    }, 0);
    const backendTotal = subtotal + Number(extraCharge) - Number(discount);
    if (Number(totalAmount) !== backendTotal) {
        res.status(400);
        throw new Error(`Invoice total mismatch: Frontend=${totalAmount}, Backend=${backendTotal}`);
    }
    // Transaction: create invoice and items
    const invoice = await prisma.$transaction(async (tx) => {
        const lastInvoice = await tx.invoice.findFirst({
            orderBy: { invoiceNumber: "desc" },
        });
        const nextInvoiceNo = (lastInvoice?.invoiceNumber ?? 1000) + 1; // Start from 1001
        const createdInvoice = await tx.invoice.create({
            data: {
                invoiceName,
                totalAmount: backendTotal,
                totalTaxAmount: totalTaxAmount || 0,
                extraCharge,
                paymentTerm: paymentTerm || null,
                extraChargeName: extraChargeName || null,
                discount,
                discountName: discountName || null,
                status,
                date,
                dueDate,
                businessName,
                email,
                phone,
                address,
                customerName,
                customerEmail: customerEmail || null,
                customerAddress: customerAddress || null,
                customerPhone: customerPhone || null,
                currency,
                invoiceNumber: nextInvoiceNo,
                note: note || null,
                companyId,
                branchId: branchId || null,
                addedBy,
                addedByRole,
                invoiceItems: {
                    create: invoiceItems.map((item) => ({
                        itemTitle: item.itemTitle,
                        itemQuantity: item.itemQuantity,
                        itemAmount: item.itemAmount,
                        itemTotal: item.itemQuantity * item.itemAmount,
                        tax: item.tax || 0
                    })),
                },
            },
            include: { invoiceItems: true },
        });
        return createdInvoice;
    });
    // Convert decimals safely to strings for JSON response
    const responseData = {
        ...invoice,
        totalAmount: invoice.totalAmount.toString(),
        discount: invoice.discount?.toString() ?? null,
        extraCharge: invoice.extraCharge?.toString() ?? null,
        invoiceItems: invoice.invoiceItems.map((i) => ({
            ...i,
            itemAmount: i.itemAmount.toString(),
            itemTotal: i.itemTotal.toString(),
            tax: i.tax.toString()
        })),
    };
    res.status(201).json({
        success: true,
        message: `Invoice "${invoice.invoiceName}" created successfully`,
        result: responseData,
    });
});
export const editInvoice = expressAsyncHandler(async (req, res) => {
    const { invoiceName, totalAmount, totalTaxAmount, extraCharge = 0, extraChargeName, discount = 0, discountName, paymentTerm, status, date, dueDate, businessName, email, phone, address, customerName, customerEmail, customerAddress, customerPhone, invoiceItems, currency, note, branchId } = req.validated.body;
    const { invoiceId } = req.validated.params;
    const companyId = req.user.companyId;
    const updatedBy = req.user.email;
    const updatedByRole = req.user.role;
    if (branchId) {
        const branchExists = await prisma.branch.findFirst({
            where: { id: branchId, companyId: req.user.companyId },
        });
        if (!branchExists) {
            res.status(400);
            throw new Error("branch not found");
        }
    }
    if (req.user.role === AllRole.MANAGER) {
        ManagerPermissions(req.user, { branchId: branchId ?? null }, res);
    }
    // Backend calculation
    const subtotal = invoiceItems.reduce((acc, item) => {
        const quantity = Number(item.itemQuantity) || 0;
        const amount = Number(item.itemAmount) || 0;
        const tax = Number(item.tax) || 0;
        // Base total for the item
        const itemBaseTotal = quantity * amount;
        // Add tax
        const itemTotal = itemBaseTotal + (itemBaseTotal * tax) / 100;
        // Validation (optional)
        if (Number(item.itemTotal) !== itemTotal) {
            res.status(400);
            throw new Error(`Item total mismatch for "${item.itemTitle}"`);
        }
        return acc + itemTotal;
    }, 0);
    const backendTotal = subtotal + Number(extraCharge) - Number(discount);
    if (Number(totalAmount) !== backendTotal) {
        res.status(400);
        throw new Error(`Invoice total mismatch: Frontend=${totalAmount}, Backend=${backendTotal}`);
    }
    // Transaction: update invoice and replace items
    const invoice = await prisma.$transaction(async (tx) => {
        // Check invoice exists and belongs to company
        const existing = await tx.invoice.findFirst({
            where: { id: invoiceId, companyId },
            include: { invoiceItems: true },
        });
        if (!existing || existing.companyId !== companyId) {
            res.status(404);
            throw new Error("Invoice not found");
        }
        // Delete old items
        await tx.invoiceItem.deleteMany({ where: { invoiceId: invoiceId } });
        // Update invoice
        const updatedInvoice = await tx.invoice.update({
            where: { id: invoiceId },
            data: {
                invoiceName,
                totalAmount: backendTotal,
                totalTaxAmount: totalTaxAmount || 0,
                extraCharge,
                extraChargeName: extraChargeName || null,
                paymentTerm: paymentTerm || null,
                discount,
                discountName: discountName || null,
                status,
                date,
                dueDate,
                businessName,
                email,
                phone,
                address,
                customerName,
                customerEmail: customerEmail || null,
                customerAddress: customerAddress || null,
                customerPhone: customerPhone || null,
                currency,
                note: note || null,
                branchId: branchId || null,
                editedBy: updatedBy,
                editedByRole: updatedByRole,
                invoiceItems: {
                    create: invoiceItems.map((item) => ({
                        itemTitle: item.itemTitle,
                        itemQuantity: item.itemQuantity,
                        itemAmount: item.itemAmount,
                        itemTotal: item.itemQuantity * item.itemAmount,
                        tax: item.tax || 0
                    })),
                },
            },
            include: { invoiceItems: true },
        });
        return updatedInvoice;
    });
    const responseData = {
        ...invoice,
        totalAmount: invoice.totalAmount.toString(),
        discount: invoice.discount?.toString() ?? null,
        extraCharge: invoice.extraCharge?.toString() ?? null,
        invoiceItems: invoice.invoiceItems.map((i) => ({
            ...i,
            itemAmount: i.itemAmount.toString(),
            itemTotal: i.itemTotal.toString(),
            tax: i.tax.toString()
        })),
    };
    res.status(200).json({
        success: true,
        message: `Invoice "${invoice.invoiceName}" updated successfully`,
        result: responseData,
    });
});
export const deleteInvoice = expressAsyncHandler(async (req, res) => {
    const { invoiceId } = req.validated.params;
    const { branchId } = req.validated.body;
    const companyId = req.user.companyId;
    if (branchId) {
        const branchExists = await prisma.branch.findFirst({
            where: { id: branchId, companyId: req.user.companyId },
        });
        if (!branchExists) {
            res.status(400);
            throw new Error("branch not found");
        }
    }
    if (req.user.role === AllRole.MANAGER) {
        ManagerPermissions(req.user, { branchId: branchId ?? null }, res);
    }
    const invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, companyId },
        include: { invoiceItems: true },
    });
    if (!invoice) {
        res.status(404);
        throw new Error("Invoice not found");
    }
    await prisma.$transaction(async (tx) => {
        // Delete invoice items first
        await tx.invoiceItem.deleteMany({
            where: {
                invoiceId: invoiceId,
                invoice: { companyId }
            }
        });
        // Delete invoice
        await tx.invoice.delete({ where: { id: invoiceId } });
    });
    res.status(200).json({
        success: true,
        message: `Invoice "${invoice.invoiceName}" deleted successfully`,
    });
});
export const getStaffs = expressAsyncHandler(async (req, res) => {
    const { search, role, page, limit } = req.validated.query;
    const skip = (page - 1) * limit;
    // filters
    const where = { companyId: req.user.companyId };
    if (role)
        where.role = role;
    if (search) {
        where.OR = [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
        ];
    }
    // count
    const totalCount = await prisma.user.count({ where });
    // fetch
    const staffs = await prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
            branch: {
                select: {
                    name: true
                }
            }
        }
    });
    // sanitize
    const safeStaffs = staffs.map(({ password, emailVerified, ...rest }) => rest);
    // calculate total pages
    const totalPages = Math.ceil(totalCount / limit);
    // response
    res.status(200).json({
        success: true,
        message: "Staffs fetched successfully",
        pagination: {
            totalCount,
            totalPages,
            currentPage: page,
            limit,
            count: safeStaffs.length,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
        },
        result: safeStaffs,
    });
});
export const getExpenses = expressAsyncHandler(async (req, res) => {
    const { category, startDate, endDate, page, limit } = req.validated.query;
    const skip = (page - 1) * limit;
    // filters
    const where = { companyId: req.user.companyId };
    if (category) {
        where.category = category;
    }
    if (startDate && endDate) {
        where.expenseDate = {
            gte: new Date(startDate),
            lte: new Date(endDate),
        };
    }
    // count
    const totalCount = await prisma.expense.count({ where });
    // fetch
    const expenses = await prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { expenseDate: "desc" },
    });
    // calculate total pages
    const totalPages = Math.ceil(totalCount / limit);
    // response
    res.status(200).json({
        success: true,
        message: "Expenses fetched successfully",
        pagination: {
            totalCount,
            totalPages,
            currentPage: page,
            limit: limit,
            count: expenses.length,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
        },
        result: expenses,
    });
});
export const getInvoices = expressAsyncHandler(async (req, res) => {
    const { search, page, limit } = req.validated.query;
    const skip = (page - 1) * limit;
    // filters
    const where = { companyId: req.user.companyId };
    if (search) {
        where.OR = [
            { invoiceName: { contains: search, mode: "insensitive" } },
            { status: { contains: search, mode: "insensitive" } },
            { currency: { contains: search, mode: "insensitive" } },
            { customerName: { contains: search, mode: "insensitive" } }
        ];
        if (!isNaN(Number(search))) {
            where.OR.push({ invoiceNo: Number(search) });
        }
    }
    // count
    const totalCount = await prisma.invoice.count({ where });
    // fetch
    const invoices = await prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
            invoiceItems: true
        },
    });
    // calculate total pages
    const totalPages = Math.ceil(totalCount / limit);
    // response
    res.status(200).json({
        success: true,
        message: "Invoices fetched successfully",
        pagination: {
            totalCount,
            totalPages,
            currentPage: page,
            limit,
            count: invoices.length,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
        },
        result: invoices,
    });
});
export const getInvoiceById = expressAsyncHandler(async (req, res) => {
    const { invoiceId } = req.validated.params;
    const user = req.user;
    // Fetch invoice and items
    const invoice = await prisma.invoice.findFirst({
        where: {
            id: invoiceId,
            companyId: user.companyId,
        },
        include: {
            invoiceItems: true,
        },
    });
    // Handle not found
    if (!invoice) {
        res.status(404);
        throw new Error("Invoice not found");
    }
    // Convert decimals safely for JSON
    const responseData = {
        ...invoice,
        totalAmount: invoice.totalAmount?.toString() ?? null,
        discount: invoice.discount?.toString() ?? null,
        extraCharge: invoice.extraCharge?.toString() ?? null,
        totalTaxAmount: invoice.totalTaxAmount?.toString() ?? null,
        invoiceItems: invoice.invoiceItems.map((i) => ({
            ...i,
            itemAmount: i.itemAmount?.toString() ?? null,
            itemTotal: i.itemTotal?.toString() ?? null,
            tax: i.tax?.toString() ?? null,
        })),
    };
    res.status(200).json({
        success: true,
        message: "Invoice retrieved successfully",
        result: responseData,
    });
});
