import * as customerService from '../services/customerService.js';

export const createCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

export const getCustomers = async (req, res, next) => {
  try {
    const result = await customerService.getCustomers(req.query);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getCustomer = async (req, res, next) => {
  try {
    const result = await customerService.getCustomerById(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    await customerService.deleteCustomer(req.params.id);
    res.json({ success: true, message: 'Customer deleted' });
  } catch (err) {
    next(err);
  }
};

export const getLedger = async (req, res, next) => {
  try {
    const result = await customerService.getCustomerLedger(req.params.customerId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
