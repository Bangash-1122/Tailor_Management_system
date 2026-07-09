import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Ledger from '../models/Ledger.js';
import { generateCustomerCode } from '../utils/generateCode.js';
import { AppError } from '../utils/AppError.js';

export const createCustomer = async (data) => {
  const customerCode = await generateCustomerCode(Customer);
  return Customer.create({ ...data, customerCode });
};

export const getCustomers = async ({ search, page = 1, limit = 10, status }) => {
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { customerCode: { $regex: search, $options: 'i' } },
    ];
  }
  if (status !== undefined) query.status = status === 'true';

  const skip = (page - 1) * limit;
  const [customers, total] = await Promise.all([
    Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Customer.countDocuments(query),
  ]);

  return { customers, total, page, pages: Math.ceil(total / limit) };
};

export const getCustomerById = async (id) => {
  const customer = await Customer.findById(id);
  if (!customer) throw new AppError('Customer not found', 404);

  const [orders, payments, measurements] = await Promise.all([
    Order.find({ customerId: id }).sort({ createdAt: -1 }).limit(10),
    Payment.find({ customerId: id }).sort({ paymentDate: -1 }).limit(10),
    (await import('../models/Measurement.js')).default.find({ customerId: id }).sort({ createdAt: -1 }),
  ]);

  return { customer, orders, payments, measurements };
};

export const updateCustomer = async (id, data) => {
  const customer = await Customer.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!customer) throw new AppError('Customer not found', 404);
  return customer;
};

export const deleteCustomer = async (id) => {
  const customer = await Customer.findByIdAndDelete(id);
  if (!customer) throw new AppError('Customer not found', 404);
  return customer;
};

export const getCustomerLedger = async (customerId) => {
  const entries = await Ledger.find({ customerId }).sort({ date: -1 });
  const customer = await Customer.findById(customerId);
  return { customer, entries, balance: customer?.ledgerBalance || 0 };
};
