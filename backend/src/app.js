import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import measurementRoutes from './routes/measurementRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import ledgerRoutes from './routes/ledgerRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import reportRoutes, {
    invoiceRouter
} from './routes/reportRoutes.js';
import {
    errorHandler,
    notFound
} from './middleware/errorHandler.js';

dotenv.config({
    path: "./.env"
});

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({
    limit: '10mb'
}));
app.use(express.urlencoded({
    extended: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/v1/auth/login', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20
}));
app.use(limiter);

app.get('/api/v1/health', (req, res) => {
    res.json({
        success: true,
        message: 'Tailor Management API is running'
    });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/measurements', measurementRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/ledger', ledgerRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/invoices', invoiceRouter);

app.use(notFound);
app.use(errorHandler);

export default app;