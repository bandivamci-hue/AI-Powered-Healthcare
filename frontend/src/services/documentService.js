import api from './api';

export const documentService = {
  // Upload document POST /api/documents/
  uploadDocument: async (file, documentName, documentType = 'prescription') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_name', documentName || file.name);
    formData.append('document_type', documentType);

    try {
      const response = await api.post('/api/documents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Document upload failed. Please try again.' };
    }
  },

  // Get full medical history list GET /api/documents/
  getDocuments: async () => {
    try {
      const response = await api.get('/api/documents/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.warn('Failed to fetch documents from API:', error);
      return [];
    }
  },

  // Get recent scans list GET /api/documents/
  getRecentScans: async () => {
    try {
      const docs = await documentService.getDocuments();
      if (docs && docs.length > 0) return docs;
      return [];
    } catch (error) {
      return [];
    }
  },

  // Get single document GET /api/documents/{id}/
  getDocumentById: async (id) => {
    try {
      const response = await api.get(`/api/documents/${id}/`);
      return response.data;
    } catch (error) {
      return null;
    }
  }
};
