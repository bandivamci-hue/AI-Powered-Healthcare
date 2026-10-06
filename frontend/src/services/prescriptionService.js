import { documentService } from './documentService';

export const prescriptionService = {
  uploadPrescription: async (file, name) => {
    return await documentService.uploadDocument(file, name);
  },

  getRecentScans: async () => {
    return await documentService.getRecentScans();
  },

  getDocumentById: async (id) => {
    return await documentService.getDocumentById(id);
  }
};
