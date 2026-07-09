import api from './axios';
export const getLedger = (customerId) => api.get(`/ledger/${customerId}`);
