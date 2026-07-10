import api from './axios';
export const getCustomers = (params) => api.get('/v1/customers', {
    params
});
export const getCustomer = (id) => api.get(`/v1/customers/${id}`);
export const createCustomer = (data) => api.post('/v1/customers', data);
export const updateCustomer = (id, data) => api.put(`/v1/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/v1/customers/${id}`);