import express from 'express'
import { validateMiddleware } from '../middlewares/validateMiddleware.ts';
import { addCustomerSchema, correctSaleSchema, deleteCustomerSchema, editCustomerSchema, getSaleByIdSchema, makeSaleSchema } from '../validations/Sale.ts';
import { addCustomer, correctSale, deleteCustomer, editCustomer, getCustomers, getIsRead, getNotifications, getProducts, getSaleById, getSales, getSalesChart, makeSale, refundSale } from '../controllers/salesController.ts';
import { paginationSchema } from '../validations/Staff.ts';

const router = express.Router();

router.post('/make-sale', validateMiddleware(makeSaleSchema), makeSale);
router.post('/correct-sale/:wrongSaleId', validateMiddleware(correctSaleSchema), correctSale);
router.post('/refund-sale/:saleId', validateMiddleware(getSaleByIdSchema), refundSale);
router.post('/add-customer', validateMiddleware(addCustomerSchema), addCustomer);
router.patch('/edit-customer/:customerId', validateMiddleware(editCustomerSchema), editCustomer);
router.delete('/delete-customer/:customerId', validateMiddleware(deleteCustomerSchema), deleteCustomer);

router.get('/get-products', validateMiddleware(paginationSchema), getProducts);
router.get('/get-customers', validateMiddleware(paginationSchema), getCustomers);
router.get('/get-sales', validateMiddleware(paginationSchema), getSales);
router.get("/get-sale/:saleId", validateMiddleware(getSaleByIdSchema), getSaleById);
router.get('/get-notifications', validateMiddleware(paginationSchema), getNotifications);
router.get('/get-read', getIsRead);
router.get('/sales-chart', getSalesChart);

export default router;