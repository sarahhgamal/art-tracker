import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTags, createTag, deleteTag } from '../api/tags'

export function useTags() {
    return useQuery({
        queryKey: ['tags'],
        queryFn: getTags,
    })
}

export function useCreateTag() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createTag,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
    })
}

export function useDeleteTag() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteTag,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
    })
}