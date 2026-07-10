import api from './axios';
export const getOrders = (params) => api.get('/v1/orders', {
    params
});
export const getOrder = (id) => api.get(`/v1/orders/${id}`);
export const createOrder = (data) => api.post('/v1/orders', data);
export const updateOrder = (id, data) => api.put(`/v1/orders/${id}`, data);
export const updateOrderStatus = (id, status) => api.put(`/v1/orders/${id}/status`, {
    status
});
export const deleteOrder = (id) => api.delete(`/v1/orders/${id}`);