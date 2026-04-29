import axios from 'axios'

export const getTags = () =>
    axios.get('/api/v1/tags').then(r => r.data.data)

export const createTag = (data) =>
    axios.post('/api/v1/tags', data).then(r => r.data.data)

export const deleteTag = (id) =>
    axios.delete(`/api/v1/tags/${id}`)