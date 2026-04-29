import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getArtworks, createArtwork, updateArtwork, deleteArtwork, uploadArtworkImage } from '../api/artworks'

export function useUploadArtworkImage() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, file }) => uploadArtworkImage(id, file),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['artworks'] }),
    })
}

export function useArtworks(medium, tagId) {
    return useQuery({
        queryKey: ['artworks', medium, tagId],
        queryFn: () => getArtworks(medium, tagId),
    })
}

export function useCreateArtwork() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createArtwork,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['artworks'] }),
    })
}

export function useUpdateArtwork() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }) => updateArtwork(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['artworks'] }),
    })
}

export function useDeleteArtwork() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteArtwork,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['artworks'] }),
    })
}