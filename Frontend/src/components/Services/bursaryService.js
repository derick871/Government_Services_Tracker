import client from './client';

export const bursaryService = {
  getApplications(params, options = {}) {
    return client.get('/bursaries', { params, ...options });
  },

  submitApplication(data) {
    return client.post('/bursaries', data);
  },

  checkStatus(applicationId, options = {}) {
    return client.get(`/bursaries/${applicationId}/status`, options);
  },
};