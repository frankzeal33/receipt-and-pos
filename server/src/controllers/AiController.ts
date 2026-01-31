import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { GoogleGenAI } from "@google/genai";
import { invoiceEmailReminderInput, parsedInvoiceFromTextInput } from "../types/zodtypes/aiType.ts";
import prisma from "../utils/db.ts";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export const parseInvoiceFromText = asyncHandler(async (req: Request, res: Response) => {
    
    const { text } = (req.validated as parsedInvoiceFromTextInput).body;

    try {
        const prompt = `You are an expert invoice data extraction AI. Analyze the following text and extract the relevant information to create an invoice.
        The output MUST be a valid JSON object.
        
        The JSON object should have the following structure:
        {
            "clientName": "string",
            "email": "string (if available)",
            "address": "string (if available)",
            "items": [
                {
                    "name": "string",
                    "quantity": "number",
                    "unitPrice" "number"
                }
            ]
        }
            
        Here is the text to parse:
        --- TEXT START ---
        ${text}
        --- TEXT END ---
        
        Extract the data and provide only the JSON object,
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        })

        console.log("res=",response.text);
        // const responseText = response.text;

        let responseText = response?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (typeof responseText !== "string") {
            throw new Error("Could not extract text from AI response");
        }

        const cleanedJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        
        // Escape bad control characters before parsing
        // cleanedJson = cleanedJson.replace(/[\u0000-\u0019]+/g, "");
        
        const parsedData = JSON.parse(cleanedJson);

        res.status(200).json({
            success: true,
            message: "Invoice information filled",
            result: parsedData
        });

        
    } catch (error) {
        throw new Error("Failed to parse invoice data from text")
    } 
  
});

export const generateInvoiceReminderEmail = asyncHandler(async (req: Request, res: Response) => {
  
    const { invoiceId } = (req.validated as invoiceEmailReminderInput).params;

    try {

        const invoice = await prisma.invoice.findFirst({
            where: { id: invoiceId, companyId: req.user.companyId },
            include: { invoiceItems: true },
        });

        if (!invoice) {
            res.status(404);
            throw new Error("Invoice not found");
        }

        const prompt = `You are a professional and polite accounting assistant. Write a friendly reminder email to a client about an overdue or upcoming invoice payment.
        
        Use the following details to personalize the email:
        - Client Name: ${invoice.customerName}
        - Invoice Number: ${invoice.invoiceNumber}
        - Amount Due: ${invoice.totalAmount.toFixed(2)}
        - Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}
            
        The tone should be friendly but clear. keep it concise. Start the email with "Subject:".
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        })

        console.log("res=",response.text);

        const responseText = response.text;

        if (typeof responseText !== "string") {
            throw new Error("Could not extract text from AI response");
        }

        res.status(200).json({
            success: true,
            message: "Email reminder generated",
            result: responseText
        });

        
    } catch (error: any) {
        throw new Error("Failed to generate email reminder from AI")
    } 
  
});

export const dashboardSummary = asyncHandler(async (req: Request, res: Response) => {
  
  try {

        // const sales = await prisma.sale.findMany({
        //     where: { companyId: req.user.companyId },
        //     include: { saleItems: true },
        // });

        // if (sales.length === 0) {
        //     res.status(400);
        //     throw new Error("No sales data available to generate insights");
        // }

        const invoices = await prisma.invoice.findMany({
            where: { companyId: req.user.companyId }
        });

        if (invoices.length === 0) {
            res.status(400);
            throw new Error("No invoice data available to generate insights");
        }

        const totalInvoices = invoices.length;
        const paidInvoices = invoices.filter(inv => inv.status === "PAID");
        const unpaidInvoices = invoices.filter(inv => inv.status !== "PAID");
        const totalRevenue = paidInvoices.reduce((acc, inv) => acc + inv.totalAmount.toNumber(), 0);
        const totalOutstanding = unpaidInvoices.reduce((acc, inv) => acc + inv.totalAmount.toNumber(), 0);
        

        const dataSummary = `
            - Total number of invoices: ${totalInvoices}
            - Total paid invoices: ${paidInvoices.length}
            - Total unpaid/pending invoices: ${unpaidInvoices.length}
            - Total revenue from paid invoices: ${totalRevenue.toFixed(2)}
            - Total outstanding amount from unpaid/pending invoices: ${totalOutstanding.toFixed(2)}
            - Recent invoices (last 5): ${invoices.slice(0, 5).map(inv => `Invoice #${inv.invoiceName} for ${inv.totalAmount.toFixed(2)} with status ${inv.status}`).join(",")}
        `;

         const prompt = `You are a friendly and insightful financial analyst for a small business owner.
            Based on the following summary of their invoice data, provide 2-3 concise and actionable insights.
            Each insight should be a short string in aJSON array.
            The insights should be encouraging and helpful. Do not just repeat the data.
            For example, if there is a high outstanding amount, suggest sending reminders. If revenue is high, be encouraging.

        
            Data Summary:
            ${dataSummary}

            Return your response as a valid JSON object with a single key "insights" which is an array of strings.
            Example format: { "insights": ["Your revenue is looking strong this month!", "You have 5 overdue invoices. consider sending reminders to get paid faster."]}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        })

        const responseText = response.text;

        if (typeof responseText !== "string") {
            throw new Error("Could not extract text from AI response");
        }

        const cleanedJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        
        const parsedData = JSON.parse(cleanedJson);

        res.status(200).json({
            success: true,
            message: "Invoice summary generated",
            result: parsedData
        });

        
    } catch (error: any) {
        throw new Error("Failed to generate summary from AI")
    } 
});