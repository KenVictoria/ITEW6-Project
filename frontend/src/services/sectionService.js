// src/services/sectionService.js
import { api } from '../lib/axios'

export const sectionService = {
    getAll: (params) => api.get('/sections', { params }),
    getById: (id) => api.get(`/sections/${id}`),
    create: (data) => api.post('/sections', data),
    update: (id, data) => api.put(`/sections/${id}`, data),
    delete: (id) => api.delete(`/sections/${id}`),
    getAvailableStudents: (id) => api.get(`/sections/${id}/available-students`),
    addStudents: (id, studentIds) => api.post(`/sections/${id}/add-students`, { student_ids: studentIds }),
    removeStudent: (sectionId, studentId) => api.delete(`/sections/${sectionId}/students/${studentId}`),
    getFilterOptions: () => api.get('/sections/filter-options'),
}