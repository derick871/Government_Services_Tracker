import client from './Client';

export const permitService = {
    // Fetch all permits
    getpermits(params = {}, options = {}) {
        return client.get('/permits', { params, ...options });
    },

    getpermitById(permitId, options = {}){
        return client.get(`/permits/${permitId}`, options);
    },

    createpermit(permitData, options = {}){
        return client.post('/permits', permitData, options)
    },

   uploadDocument(permitId, formData) {
    return client.post(`/permits/${permitId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};