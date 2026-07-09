import * as measurementService from '../services/measurementService.js';

export const createMeasurement = async (req, res, next) => {
  try {
    const measurement = await measurementService.createMeasurement(req.body);
    res.status(201).json({ success: true, data: measurement });
  } catch (err) {
    next(err);
  }
};

export const getMeasurements = async (req, res, next) => {
  try {
    const result = await measurementService.getMeasurements(req.query);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getMeasurement = async (req, res, next) => {
  try {
    const measurement = await measurementService.getMeasurementById(req.params.id);
    res.json({ success: true, data: measurement });
  } catch (err) {
    next(err);
  }
};

export const updateMeasurement = async (req, res, next) => {
  try {
    const measurement = await measurementService.updateMeasurement(req.params.id, req.body);
    res.json({ success: true, data: measurement });
  } catch (err) {
    next(err);
  }
};

export const deleteMeasurement = async (req, res, next) => {
  try {
    await measurementService.deleteMeasurement(req.params.id);
    res.json({ success: true, message: 'Measurement deleted' });
  } catch (err) {
    next(err);
  }
};
