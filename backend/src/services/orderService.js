import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import Ledger from '../models/Ledger.js';
import Notification from '../models/Notification.js';
import { generateOrderNo } from '../utils/generateCode.js';
import { AppError } from '../utils/AppError.js';

const addLedgerEntry = async (customerId, orderId, type, amount, description) => {
  const customer = await Customer.findById(customerId);
  const newBalance = type === 'debit'
    ? customer.ledgerBalance + amount
    : customer.ledgerBalance - amount;

  customer.ledgerBalance = newBalance;
  await customer.save();

  return Ledger.create({
    customerId,
    orderId,
    type,
    amount,
    balance: newBalance,
    description,
    date: new Date(),
  });
};

export const createOrder = async (data, userId) => {
  const orderNo = await generateOrderNo(Order);
  const totalAmount = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const advanceAmount = data.advanceAmount || 0;
  const remainingAmount = totalAmount - advanceAmount;

  const order = await Order.create({
    ...data,
    orderNo,
    totalAmount,
    advanceAmount,
    remainingAmount,
  });

  await addLedgerEntry(
    data.customerId,
    order._id,
    'debit',
    totalAmount,
    `Order ${orderNo} created`
  );

  if (advanceAmount > 0) {
    await addLedgerEntry(
      data.customerId,
      order._id,
      'credit',
      advanceAmount,
      `Advance payment for order ${orderNo}`
    );
  }

  if (data.assignedTailorId) {
    await Notification.create({
      userId: data.assignedTailorId,
      title: 'New Order Assigned',
      message: `Order ${orderNo} has been assigned to you`,
      type: 'task',
    });
  }

  return order.populate([
    { path: 'customerId', select: 'name phone customerCode' },
    { path: 'assignedTailorId', select: 'name' },
    { path: 'measurementId' },
  ]);
};

export const getOrders = async ({ status, customerId, tailorId, search, page = 1, limit = 10 }) => {
  const query = {};
  if (status) query.status = status;
  if (customerId) query.customerId = customerId;
  if (tailorId) query.assignedTailorId = tailorId;
  if (search) query.orderNo = { $regex: search, $options: 'i' };

  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('customerId', 'name phone customerCode')
      .populate('assignedTailorId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  return { orders, total, page, pages: Math.ceil(total / limit) };
};

export const getOrderById = async (id) => {
  const order = await Order.findById(id)
    .populate('customerId', 'name phone customerCode address email')
    .populate('assignedTailorId', 'name phone')
    .populate('measurementId');
  if (!order) throw new AppError('Order not found', 404);
  return order;
};

export const updateOrderStatus = async (id, status, stitchingNotes, userId) => {
  const order = await Order.findById(id);
  if (!order) throw new AppError('Order not found', 404);

  order.status = status;
  if (stitchingNotes) order.stitchingNotes = stitchingNotes;
  await order.save();

  await Notification.create({
    customerId: order.customerId,
    title: 'Order Status Updated',
    message: `Order ${order.orderNo} is now ${status}`,
    type: 'order',
  });

  return order.populate([
    { path: 'customerId', select: 'name phone customerCode' },
    { path: 'assignedTailorId', select: 'name' },
  ]);
};

export const updateOrder = async (id, data) => {
  const order = await Order.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('customerId', 'name phone customerCode')
    .populate('assignedTailorId', 'name');
  if (!order) throw new AppError('Order not found', 404);
  return order;
};

export const deleteOrder = async (id) => {
  const order = await Order.findByIdAndDelete(id);
  if (!order) throw new AppError('Order not found', 404);
  return order;
};
