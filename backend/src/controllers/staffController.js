import * as staffService from '../services/staffService.js';

export const createStaff = async (req, res, next) => {
  try {
    const member = await staffService.createStaff(req.body);
    res.status(201).json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
};

export const getStaff = async (req, res, next) => {
  try {
    const result = await staffService.getStaff(req.query);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const updateStaff = async (req, res, next) => {
  try {
    const member = await staffService.updateStaff(req.params.id, req.body);
    res.json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
};

export const deleteStaff = async (req, res, next) => {
  try {
    await staffService.deleteStaff(req.params.id);
    res.json({ success: true, message: 'Staff member deleted' });
  } catch (err) {
    next(err);
  }
};
