import axios from 'axios'

export const getSessions = () =>
    axios.get('/api/v1/sessions').then(r => r.data.data)

export const createSession = (data) =>
    axios.post('/api/v1/sessions', data).then(r => r.data.data)

export const updateSession = (id, data) =>
    axios.put(`/api/v1/sessions/${id}`, data).then(r => r.data.data)

export const deleteSession = (id) =>
    axios.delete(`/api/v1/sessions/${id}`)