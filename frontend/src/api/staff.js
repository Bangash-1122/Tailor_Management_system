import api from './axios';
export const getStaff = (params) => api.get('/v1/staff', {
    params
});
export const getStaffMember = (id) => api.get(`/v1/staff/${id}`);
export const createStaff = (data) => api.post('/v1/staff', data);
export const updateStaff = (id, data) => api.put(`/v1/staff/${id}`, data);
export const deleteStaff = (id) => api.delete(`/v1/staff/${id}`);