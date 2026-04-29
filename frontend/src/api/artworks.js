import axios from 'axios'

export const getArtworks = (medium, tagId) =>
    axios.get('/api/v1/artworks', {
        params: {
            ...(medium ? { medium } : {}),
            ...(tagId ? { tagId } : {}),
        }
    }).then(r => r.data.data)
    
export const createArtwork = (data) =>
    axios.post('/api/v1/artworks', data).then(r => r.data.data)

export const updateArtwork = (id, data) =>
    axios.put(`/api/v1/artworks/${id}`, data).then(r => r.data.data)

export const deleteArtwork = (id) =>
    axios.delete(`/api/v1/artworks/${id}`)

export const uploadArtworkImage = (id, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return axios.post(`/api/v1/artworks/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data.data)
}