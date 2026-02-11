import expressAsyncHandler from "express-async-handler";
import prisma from "../utils/db.js";
export const addBranch = expressAsyncHandler(async (req, res) => {
    const { name, location } = req.validated.body;
    const nameExists = await prisma.branch.findFirst({
        where: {
            companyId: req.user.companyId,
            name: {
                equals: name,
                mode: "insensitive",
            },
        },
    });
    if (nameExists) {
        res.status(400);
        throw new Error('This branch name already exists');
    }
    const newBranch = await prisma.branch.create({
        data: {
            name,
            location,
            companyId: req.user.companyId
        },
    });
    res.status(201).json({
        success: true,
        message: `New branch "${newBranch.name}" added successfully`
    });
});
export const editBranch = expressAsyncHandler(async (req, res) => {
    const { branchId, name, location } = req.validated.body;
    const dataToUpdate = {};
    if (name)
        dataToUpdate.name = name;
    if (location)
        dataToUpdate.location = location;
    const branchIdExists = await prisma.branch.findFirst({ where: { id: branchId, companyId: req.user.companyId } });
    if (!branchIdExists) {
        res.status(404);
        throw new Error('This branch does not exist in your company');
    }
    const updatedBranch = await prisma.branch.update({
        where: { id: branchId, companyId: req.user.companyId },
        data: dataToUpdate
    });
    res.status(200).json({
        success: true,
        message: `Branch ${updatedBranch.name} updated successfully`
    });
});
export const disableEnableBranch = expressAsyncHandler(async (req, res) => {
    const { status } = req.validated.body;
    const { branchId } = req.validated.params;
    const branchIdExists = await prisma.branch.findFirst({ where: { id: branchId, companyId: req.user.companyId } });
    if (!branchIdExists) {
        res.status(404);
        throw new Error('This branch does not exist in your company');
    }
    const updatedBranch = await prisma.branch.update({
        where: { id: branchId, companyId: req.user.companyId },
        data: {
            status
        }
    });
    res.status(200).json({
        success: true,
        message: `Branch ${updatedBranch.name} ${updatedBranch.status === "ACTIVE" ? "enabled" : "disabled"} successfully`
    });
});
export const deleteBranch = expressAsyncHandler(async (req, res) => {
    const { branchId } = req.validated.params;
    const branchIdExists = await prisma.branch.findFirst({ where: { id: branchId, companyId: req.user.companyId } });
    if (!branchIdExists) {
        res.status(404);
        throw new Error('This branch does not exist in your company');
    }
    const branchCount = await prisma.branch.count({
        where: { companyId: req.user.companyId },
    });
    // Prevent deleting the last branch
    if (branchCount <= 1) {
        res.status(400);
        throw new Error("You cannot delete the only branch in your company");
    }
    const deleteBranch = await prisma.branch.delete({
        where: { id: branchId, companyId: req.user.companyId },
    });
    res.status(200).json({
        success: true,
        message: `Branch "${deleteBranch.name}" deleted successfully`,
    });
});
export const getBranches = expressAsyncHandler(async (req, res) => {
    const { search, page, limit } = req.validated.query;
    const skip = (page - 1) * limit;
    // filters
    const where = { companyId: req.user.companyId };
    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
        ];
    }
    // count
    const totalCount = await prisma.branch.count({ where });
    // fetch
    const branches = await prisma.branch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
    });
    // calculate total pages
    const totalPages = Math.ceil(totalCount / limit);
    // response
    res.status(200).json({
        success: true,
        message: "Branches fetched successfully",
        pagination: {
            totalCount,
            totalPages,
            currentPage: page,
            limit,
            count: branches.length,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
        },
        result: branches,
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
