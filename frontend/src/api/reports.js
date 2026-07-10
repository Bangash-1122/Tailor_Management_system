import api from './axios';
export const getDashboard = () => api.get('/v1/reports/dashboard');
export const getProfitLoss = (params) => api.get('/v1/reports/profit-loss', {
    params
});
export const getDeliveryReport = () => api.get('/v1/reports/delivery');
export const getInvoice = (orderId) => api.get(`/v1/invoices/${orderId}`, {
    responseType: 'blob'
});