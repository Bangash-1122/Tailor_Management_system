import api from './axios';
export const getExpenses = (params) => api.get('/v1/expenses', { params });
export const createExpense = (data) => api.post('/v1/expenses', data);
export const updateExpense = (id, data) => api.put(`/v1/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/v1/expenses/${id}`);
