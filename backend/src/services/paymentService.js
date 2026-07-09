import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import Ledger from '../models/Ledger.js';
import { AppError } from '../utils/AppError.js';

const addLedgerCredit = async (customerId, paymentId, orderId, amount, description) => {
  const customer = await Customer.findById(customerId);
  customer.ledgerBalance = Math.max(0, customer.ledgerBalance - amount);
  await customer.save();

  return Ledger.create({
    customerId,
    orderId,
    paymentId,
    type: 'credit',
    amount,
    balance: customer.ledgerBalance,
    description,
    date: new Date(),
  });
};

export const createPayment = async (data, userId) => {
  const payment = await Payment.create({ ...data, createdBy: userId });

  if (data.orderId) {
    const order = await Order.findById(data.orderId);
    if (order) {
      order.advanceAmount = (order.advanceAmount || 0) + data.amount;
      order.remainingAmount = Math.max(0, order.totalAmount - order.advanceAmount);
      if (order.remainingAmount === 0) order.status = order.status === 'delivered' ? 'delivered' : order.status;
      await order.save();
    }
  }

  await addLedgerCredit(
    data.customerId,
    payment._id,
    data.orderId,
    data.amount,
    `Payment received - ${data.paymentMethod}`
  );

  return payment.populate([
    { path: 'customerId', select: 'name phone customerCode' },
    { path: 'orderId', select: 'orderNo totalAmount' },
  ]);
};

export const getPayments = async ({ customerId, orderId, page = 1, limit = 10 }) => {
  const query = {};
  if (customerId) query.customerId = customerId;
  if (orderId) query.orderId = orderId;

  const skip = (page - 1) * limit;
  const [payments, total] = await Promise.all([
    Payment.find(query)
      .populate('customerId', 'name phone customerCode')
      .populate('orderId', 'orderNo')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(query),
  ]);

  return { payments, total, page, pages: Math.ceil(total / limit) };
};

export const getPaymentById = async (id) => {
  const payment = await Payment.findById(id)
    .populate('customerId', 'name phone customerCode address')
    .populate('orderId');
  if (!payment) throw new AppError('Payment not found', 404);
  return payment;
};
