import prisma from "../utils/db.js";
import { Prisma } from "@prisma/client";
import asyncHandler from "express-async-handler";
import { cleanInput } from "../utils/helpers.js";
export const makeSale = asyncHandler(async (req, res) => {
    const { items, discount = 0, taxRate = 0, paymentType, customerName, customerId, customerIdentifier } = req.validated.body;
    const companyId = req.user.companyId;
    const sellerEmail = req.user.email;
    const role = req.user.role;
    // 1. Fetch products
    const productIds = items.map(i => i.productId);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds }, companyId }
    });
    if (products.length !== items.length) {
        res.status(404);
        throw new Error("One or more products not found");
    }
    // 2. Validate stock + calculate subtotal
    let subtotal = new Prisma.Decimal(0);
    const saleItemsData = items.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (product.quantity < item.quantity) {
            res.status(400);
            throw new Error(`${product.productName} is out of stock`);
        }
        const lineTotal = product.price.mul(item.quantity);
        subtotal = subtotal.add(lineTotal);
        return {
            productId: product.id,
            quantity: item.quantity,
            price: product.price,
            total: lineTotal
        };
    });
    // 3. Apply discount and tax
    const discountAmount = new Prisma.Decimal(discount);
    const taxable = subtotal.sub(discountAmount);
    const taxAmount = taxable.mul(new Prisma.Decimal(taxRate).div(100));
    const totalAmount = taxable.add(taxAmount);
    // 4. Transaction: create sale + update stock
    const sale = await prisma.$transaction(async (tx) => {
        const lastSale = await tx.sale.findFirst({
            orderBy: { receiptNo: 'desc' }
        });
        const nextInvoiceNo = (lastSale?.receiptNo ?? 1000) + 1; // start from 1001
        const createdSale = await tx.sale.create({
            data: {
                companyId,
                sellerEmail,
                role,
                receiptNo: nextInvoiceNo,
                subtotal,
                discount: discountAmount,
                tax: taxAmount,
                totalAmount,
                paymentType,
                customerName,
                customerId: customerId || null,
                customerIdentifier: customerIdentifier || null,
                saleItems: { create: saleItemsData.map(item => ({
                        quantity: item.quantity,
                        price: item.price,
                        total: item.total,
                        product: {
                            connect: { id: item.productId }, // connect by relation
                        },
                    })) }
            },
            include: { saleItems: true }
        });
        for (const item of items) {
            await tx.product.update({
                where: { id: item.productId },
                data: { quantity: { decrement: item.quantity } }
            });
        }
        return createdSale;
    });
    // 5. Convert Prisma Decimals to strings for JSON safety
    const responseData = {
        ...sale,
        subtotal: sale.subtotal.toString(),
        discount: sale.discount.toString(),
        tax: sale.tax.toString(),
        totalAmount: sale.totalAmount.toString(),
        saleItems: sale.saleItems.map(i => ({
            ...i,
            price: i.price.toString(),
            total: i.total.toString(),
        })),
    };
    res.status(201).json({
        success: true,
        message: "Sale completed",
        data: responseData,
    });
});
export const correctSale = asyncHandler(async (req, res) => {
    const { items, discount = 0, taxRate = 0, paymentType, customerName, customerId, customerIdentifier } = req.validated.body;
    const { wrongSaleId } = req.validated.params;
    const companyId = req.user.companyId;
    const sellerEmail = req.user.email;
    const role = req.user.role;
    let subtotal = new Prisma.Decimal(0);
    const sale = await prisma.$transaction(async (tx) => {
        const lastSale = await tx.sale.findFirst({
            orderBy: { receiptNo: 'desc' }
        });
        const nextInvoiceNo = (lastSale?.receiptNo ?? 1000) + 1; // start from 1001
        const originalSale = await tx.sale.findFirst({
            where: { id: wrongSaleId, companyId },
        });
        if (!originalSale) {
            res.status(404);
            throw new Error("Sale not found for this company");
        }
        if (originalSale.status === "CORRECTED") {
            res.status(400);
            throw new Error("This sale has already been corrected before, use the latest corrected sale");
        }
        if (originalSale.status === "REFUNDED") {
            res.status(400);
            throw new Error("This sale has already been refunded to the customer, create a new sale");
        }
        // Mark original sale as refunded or corrected
        await tx.sale.update({
            where: { id: wrongSaleId, companyId },
            data: { status: "CORRECTED" }
        });
        // Get the sale items first
        const saleItems = await tx.saleItem.findMany({
            where: { saleId: wrongSaleId, sale: {
                    companyId
                }, }
        });
        // Reverse stock for each product
        for (const item of saleItems) {
            await tx.product.update({
                where: { id: item.productId, companyId },
                data: {
                    quantity: {
                        increment: item.quantity // add back what was sold
                    }
                }
            });
        }
        // Fetch products
        const productIds = items.map(i => i.productId);
        const products = await tx.product.findMany({
            where: { id: { in: productIds }, companyId }
        });
        if (products.length !== items.length) {
            res.status(404);
            throw new Error("One or more products not found");
        }
        const saleItemsData = items.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (product.quantity < item.quantity) {
                res.status(400);
                throw new Error(`${product.productName} is out of stock`);
            }
            const lineTotal = product.price.mul(item.quantity);
            subtotal = subtotal.add(lineTotal);
            return {
                productId: product.id,
                quantity: item.quantity,
                price: product.price,
                total: lineTotal
            };
        });
        // Apply discount and tax
        const discountAmount = new Prisma.Decimal(discount);
        const taxable = subtotal.sub(discountAmount);
        const taxAmount = taxable.mul(new Prisma.Decimal(taxRate).div(100));
        const totalAmount = taxable.add(taxAmount);
        const correctedSale = await tx.sale.create({
            data: {
                companyId,
                sellerEmail,
                role,
                receiptNo: nextInvoiceNo,
                subtotal,
                discount: discountAmount,
                tax: taxAmount,
                totalAmount,
                paymentType,
                status: "PAID",
                customerName,
                customerId: customerId ?? null,
                customerIdentifier: customerIdentifier ?? null,
                saleItems: { create: saleItemsData.map(item => ({
                        quantity: item.quantity,
                        price: item.price,
                        total: item.total,
                        product: {
                            connect: { id: item.productId }, // connect by relation
                        },
                    })) }
            },
            include: { saleItems: true }
        });
        await tx.sale.update({
            where: { id: wrongSaleId, companyId },
            data: { correctedWith: correctedSale.id }
        });
        for (const item of items) {
            await tx.product.update({
                where: { id: item.productId },
                data: { quantity: { decrement: item.quantity } }
            });
        }
        const responseData = {
            ...correctedSale,
            subtotal: correctedSale.subtotal.toString(),
            discount: correctedSale.discount.toString(),
            tax: correctedSale.tax.toString(),
            totalAmount: correctedSale.totalAmount.toString(),
            saleItems: correctedSale.saleItems.map(i => ({
                ...i,
                price: i.price.toString(),
                total: i.total.toString(),
            })),
        };
        res.status(201).json({
            success: true,
            message: "Sale corrected and completed",
            result: responseData
        });
    });
});
export const refundSale = asyncHandler(async (req, res) => {
    const { saleId } = req.validated.params;
    const companyId = req.user.companyId;
    const sale = await prisma.$transaction(async (tx) => {
        const originalSale = await tx.sale.findFirst({
            where: { id: saleId, companyId },
        });
        if (!originalSale) {
            res.status(404);
            throw new Error("Sale not found for this company");
        }
        if (originalSale.status === "CORRECTED") {
            res.status(400);
            throw new Error("This sale has already been corrected before, use the latest corrected sale");
        }
        if (originalSale.status === "REFUNDED") {
            res.status(400);
            throw new Error("This sale has already been refunded to the customer, create a new sale");
        }
        // Mark original sale as refunded or corrected
        await tx.sale.update({
            where: { id: saleId, companyId },
            data: { status: "REFUNDED" }
        });
        res.status(201).json({
            success: true,
            message: "Sale has been marked as refunded",
        });
    });
});
export const addCustomer = asyncHandler(async (req, res) => {
    const { name, email, phone, address } = req.validated.body;
    const companyId = req.user.companyId;
    // Check for duplicates
    const existing = await prisma.customer.findFirst({
        where: {
            companyId,
            OR: [
                ...(email ? [{ email }] : []),
                ...(phone ? [{ phone }] : []),
            ],
        },
    });
    if (existing) {
        res.status(400);
        throw new Error(existing.email === email
            ? "A customer with this email already exists"
            : "A customer with this phone number already exists");
    }
    // Create new customer
    const customer = await prisma.customer.create({
        data: {
            name,
            email: email || null,
            phone: phone || null,
            address: address || null,
            companyId
        },
    });
    res.status(201).json({
        success: true,
        message: `Customer "${customer.name}" added successfully`,
        result: customer,
    });
});
export const editCustomer = asyncHandler(async (req, res) => {
    const { customerId } = req.validated.params;
    const { name, email, phone, address } = req.validated.body;
    const companyId = req.user.companyId;
    // Check customer exists
    const existing = await prisma.customer.findFirst({
        where: { id: customerId, companyId },
    });
    if (!existing) {
        res.status(404);
        throw new Error("Customer not found");
    }
    // Check if another customer already has this email/phone
    const duplicate = await prisma.customer.findFirst({
        where: {
            companyId,
            id: { not: customerId }, // exclude current customer
            OR: [
                ...(email ? [{ email }] : []),
                ...(phone ? [{ phone }] : []),
            ],
        },
    });
    if (duplicate) {
        res.status(400);
        throw new Error(duplicate.email === email
            ? "Another customer with this email already exists"
            : "Another customer with this phone number already exists");
    }
    // Update customer
    const updated = await prisma.customer.update({
        where: { id: customerId, companyId },
        data: {
            name: cleanInput(name),
            email: cleanInput(email),
            phone: cleanInput(phone),
            address: cleanInput(address)
        },
    });
    res.status(200).json({
        success: true,
        message: `Customer "${updated.name}" updated successfully`,
        result: updated,
    });
});
export const deleteCustomer = asyncHandler(async (req, res) => {
    const { customerId } = req.validated.params;
    const companyId = req.user.companyId;
    // Check customer exists
    const customer = await prisma.customer.findFirst({
        where: { id: customerId, companyId },
    });
    if (!customer) {
        res.status(404);
        throw new Error("Customer not found");
    }
    // Delete customer
    await prisma.customer.delete({
        where: { id: customerId, companyId },
    });
    res.status(200).json({
        success: true,
        message: `Customer "${customer.name}" deleted successfully`,
    });
});
export const getProducts = asyncHandler(async (req, res) => {
    const { search, page, limit } = req.validated.query;
    const skip = (page - 1) * limit;
    // filters
    const where = { companyId: req.user.companyId };
    if (search) {
        where.OR = [
            { productName: { contains: search, mode: "insensitive" } },
        ];
    }
    // count
    const totalCount = await prisma.product.count({ where });
    // fetch
    const products = await prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
            branch: {
                select: {
                    name: true,
                    location: true,
                },
            },
        },
    });
    // calculate total pages
    const totalPages = Math.ceil(totalCount / limit);
    // response
    res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        pagination: {
            totalCount,
            totalPages,
            currentPage: page,
            limit,
            count: products.length,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
        },
        result: products,
    });
});
export const getCustomers = asyncHandler(async (req, res) => {
    const { search, page, limit } = req.validated.query;
    const skip = (page - 1) * limit;
    // filters
    const where = { companyId: req.user.companyId };
    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
        ];
    }
    // count
    const totalCount = await prisma.customer.count({ where });
    // fetch
    const customers = await prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
    });
    // calculate total pages
    const totalPages = Math.ceil(totalCount / limit);
    // response
    res.status(200).json({
        success: true,
        message: "Customers fetched successfully",
        pagination: {
            totalCount,
            totalPages,
            currentPage: page,
            limit,
            count: customers.length,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
        },
        result: customers,
    });
});
export const getSales = asyncHandler(async (req, res) => {
    const { search, page, limit, status } = req.validated.query;
    const skip = (page - 1) * limit;
    const where = { companyId: req.user.companyId };
    if (status) {
        where.status = { equals: status };
    }
    if (search) {
        where.OR = [
            { sellerEmail: { contains: search, mode: "insensitive" } },
            { role: { contains: search, mode: "insensitive" } },
            { paymentType: { contains: search, mode: "insensitive" } },
            { status: { contains: search, mode: "insensitive" } },
            { customerName: { contains: search, mode: "insensitive" } },
        ];
        if (!isNaN(Number(search))) {
            where.OR.push({ receiptNo: Number(search) });
        }
    }
    // count
    const totalCount = await prisma.sale.count({ where });
    // fetch
    const sales = await prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
            saleItems: {
                include: {
                    product: {
                        select: { productName: true },
                    },
                },
            },
        },
    });
    // calculate total pages
    const totalPages = Math.ceil(totalCount / limit);
    // response
    res.status(200).json({
        success: true,
        message: "Sales fetched successfully",
        pagination: {
            totalCount,
            totalPages,
            currentPage: page,
            limit,
            count: sales.length,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
        },
        result: sales,
    });
});
export const getSaleById = asyncHandler(async (req, res) => {
    const { saleId } = req.validated.params;
    const sale = await prisma.sale.findUnique({
        where: {
            id: saleId,
            companyId: req.user.companyId,
        },
        include: {
            saleItems: {
                include: {
                    product: {
                        select: {
                            productName: true,
                        },
                    },
                },
            },
        },
    });
    if (!sale) {
        res.status(404);
        throw new Error("Sale not found");
    }
    const totalAmount = sale.saleItems.reduce((acc, item) => acc + item.quantity * item.price.toNumber(), 0);
    const saleItems = sale.saleItems.map(item => {
        const { product, ...rest } = item;
        return {
            ...rest,
            productName: product?.productName ?? "Deleted product",
        };
    });
    res.status(200).json({
        success: true,
        message: "Sale fetched successfully",
        result: {
            ...sale,
            saleItems,
            totalAmount,
        },
    });
});
export const getNotifications = asyncHandler(async (req, res) => {
    const { page, limit } = req.validated.query;
    const skip = (page - 1) * limit;
    // filters
    const where = { companyId: req.user.companyId };
    // count
    const totalCount = await prisma.notification.count({ where });
    // fetch
    const customers = await prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
    });
    // calculate total pages
    const totalPages = Math.ceil(totalCount / limit);
    // response
    res.status(200).json({
        success: true,
        message: "Notifications fetched successfully",
        pagination: {
            totalCount,
            totalPages,
            currentPage: page,
            limit,
            count: customers.length,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
        },
        result: customers,
    });
});
export const getIsRead = asyncHandler(async (req, res) => {
    const user = await prisma.userNotification.findFirst({
        where: { companyId: req.user.companyId, userId: req.user.id, role: req.user.role }
    });
    if (!user) {
        res.status(200).json({
            success: true,
            message: "Read Status fetched successfully",
            result: {
                read: true
            },
        });
    }
    else {
        res.status(200).json({
            success: true,
            message: "Read Status fetched successfully",
            result: {
                read: user.readAll
            },
        });
    }
});
export const getSalesChart = asyncHandler(async (req, res) => {
    const companyId = req.user?.companyId;
    const sales = await prisma.sale.groupBy({
        by: ["createdAt", "status"],
        where: { companyId },
        _sum: { totalAmount: true },
    });
    const result = {};
    sales.forEach((item) => {
        const date = item.createdAt.toISOString().split("T")[0];
        if (!result[date]) {
            result[date] = { date, paid: 0, refunded: 0, corrected: 0 };
        }
        switch (item.status) {
            case "PAID":
                result[date].paid += Number(item._sum.totalAmount || 0);
                break;
            case "REFUNDED":
                result[date].refunded += Number(item._sum.totalAmount || 0);
                break;
            case "CORRECTED":
                result[date].corrected += Number(item._sum.totalAmount || 0);
                break;
        }
    });
    const chartData = Object.values(result).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    res.status(200).json({
        success: true,
        message: "Sales chart fetched successfully",
        result: chartData
    });
});
