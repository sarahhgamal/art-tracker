import axios from 'axios'

export const register = (data) =>
    axios.post('/api/v1/auth/register', data).then(r => r.data.data)

export const login = (data) =>
    axios.post('/api/v1/auth/login', data).then(r => r.data.data)