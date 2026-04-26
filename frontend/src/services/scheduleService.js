// src/services/scheduleService.js

import { api } from '../lib/axios'

export const scheduleService = {
    // Get all schedules
    getAll: () => api.get('/schedules'),
    
    // Get single schedule
    getById: (id) => api.get(`/schedules/${id}`),
    
    // Create schedule
    create: (data) => api.post('/schedules', data),
    
    // Update schedule
    update: (id, data) => api.put(`/schedules/${id}`, data),
    
    // Delete schedule
    delete: (id) => api.delete(`/schedules/${id}`),
    
    // Get available time slots
    getAvailableTimeSlots: (params) => api.get('/schedules/available-time-slots', { params }),
    
    // Get faculty schedule
    getFacultySchedule: (facultyId) => api.get(`/schedules/faculty/${facultyId}`),
    
    // Get statistics
    getStatistics: () => api.get('/schedules/statistics'),
    
    // Bulk create
    bulkCreate: (data) => api.post('/schedules/bulk', data),
}