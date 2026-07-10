import api from './axios';
export const getMeasurements = (params) => api.get('/v1/measurements', {
    params
});
export const getMeasurement = (id) => api.get(`/v1/measurements/${id}`);
export const createMeasurement = (data) => api.post('/v1/measurements', data);
export const updateMeasurement = (id, data) => api.put(`/v1/measurements/${id}`, data);
export const deleteMeasurement = (id) => api.delete(`/v1/measurements/${id}`);