import api from './axios';
export const getPayments = (params) => api.get('/v1/payments', {
    params
});
export const createPayment = (data) => api.post('/v1/payments', data);
export const deletePayment = (id) => api.delete(`/v1/payments/${id}`);