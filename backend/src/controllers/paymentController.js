import * as paymentService from '../services/paymentService.js';

export const createPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.createPayment(req.body, req.user._id);
    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

export const getPayments = async (req, res, next) => {
  try {
    const result = await paymentService.getPayments(req.query);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};
