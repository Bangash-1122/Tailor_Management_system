import * as reportService from '../services/reportService.js';
import Order from '../models/Order.js';
import PDFDocument from 'pdfkit';

export const getDashboard = async (req, res, next) => {
  try {
    const stats = await reportService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

export const getProfitLoss = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const report = await reportService.getProfitLossReport(year, month);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

export const getDeliveryReport = async (req, res, next) => {
  try {
    const orders = await reportService.getDeliveryReport();
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

export const generateInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('customerId', 'name phone address email customerCode')
      .populate('measurementId');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=invoice-${order.orderNo}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('TAILOR MANAGEMENT SYSTEM', { align: 'center' });
    doc.fontSize(10).text('Professional Tailoring Services', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Invoice: ${order.orderNo}`);
    doc.fontSize(10);
    doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`);
    doc.text(`Delivery: ${new Date(order.deliveryDate).toLocaleDateString()}`);
    doc.moveDown();
    doc.text(`Customer: ${order.customerId.name}`);
    doc.text(`Phone: ${order.customerId.phone}`);
    doc.text(`Code: ${order.customerId.customerCode}`);
    if (order.customerId.address) doc.text(`Address: ${order.customerId.address}`);
    doc.moveDown();

    doc.fontSize(12).text('Items:', { underline: true });
    order.items.forEach((item) => {
      doc.fontSize(10).text(
        `${item.itemName} x${item.quantity} - Rs. ${item.unitPrice} = Rs. ${item.totalPrice}`
      );
    });
    doc.moveDown();
    doc.fontSize(11).text(`Total Amount: Rs. ${order.totalAmount}`);
    doc.text(`Advance Paid: Rs. ${order.advanceAmount}`);
    doc.text(`Remaining Balance: Rs. ${order.remainingAmount}`);
    doc.text(`Status: ${order.status.toUpperCase()}`);
    doc.moveDown();
    doc.fontSize(9).text('Thank you for your business!', { align: 'center' });
    doc.end();
  } catch (err) {
    next(err);
  }
};
