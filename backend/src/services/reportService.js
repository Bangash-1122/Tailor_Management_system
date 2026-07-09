import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Expense from '../models/Expense.js';
import Notification from '../models/Notification.js';

export const getDashboardStats = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));

  const [
    totalCustomers,
    activeOrders,
    pendingDeliveries,
    monthlyIncome,
    monthlyExpenses,
    dailyIncome,
    recentOrders,
    notifications,
    orderStatusBreakdown,
    pendingPayments,
  ] = await Promise.all([
    Customer.countDocuments({ status: true }),
    Order.countDocuments({ status: { $nin: ['delivered', 'cancelled'] } }),
    Order.countDocuments({
      status: { $nin: ['delivered', 'cancelled'] },
      deliveryDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    }),
    Payment.aggregate([
      { $match: { paymentDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      { $match: { expenseDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([
      { $match: { paymentDate: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Order.find()
      .populate('customerId', 'name phone customerCode')
      .sort({ createdAt: -1 })
      .limit(5),
    Notification.find({ read: false }).sort({ createdAt: -1 }).limit(5),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { remainingAmount: { $gt: 0 }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$remainingAmount' }, count: { $sum: 1 } } },
    ]),
  ]);

  const income = monthlyIncome[0]?.total || 0;
  const expenses = monthlyExpenses[0]?.total || 0;

  return {
    totalCustomers,
    activeOrders,
    pendingDeliveries,
    totalIncome: income,
    monthlyExpenses: expenses,
    netProfit: income - expenses,
    dailyIncome: dailyIncome[0]?.total || 0,
    pendingPayments: pendingPayments[0]?.total || 0,
    pendingPaymentCount: pendingPayments[0]?.count || 0,
    recentOrders,
    notifications,
    orderStatusBreakdown: orderStatusBreakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
  };
};

export const getProfitLossReport = async (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const [income, expenses] = await Promise.all([
    Payment.aggregate([
      { $match: { paymentDate: { $gte: start, $lte: end } } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      { $match: { expenseDate: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]),
  ]);

  const totalIncome = income.reduce((s, i) => s + i.total, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.total, 0);

  return { income, expenses, totalIncome, totalExpenses, netProfit: totalIncome - totalExpenses };
};

export const getDeliveryReport = async () => {
  return Order.find({ status: { $in: ['ready', 'trial'] } })
    .populate('customerId', 'name phone customerCode')
    .sort({ deliveryDate: 1 });
};
