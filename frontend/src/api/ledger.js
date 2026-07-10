import api from './axios';
export const getLedger = (customerId) => api.get(`/v1/ledger/${customerId}`);