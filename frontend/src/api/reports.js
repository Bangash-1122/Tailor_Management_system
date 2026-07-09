import api from './axios';
export const getDashboard = () => api.get('/reports/dashboard');
export const getProfitLoss = (params) => api.get('/reports/profit-loss', { params });
export const getDeliveryReport = () => api.get('/reports/delivery');
export const getInvoice = (orderId) => api.get(`/invoices/${orderId}`, { responseType: 'blob' });
