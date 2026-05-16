import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../api/projectApi';
import type { ProjectCreate, FetchProjectsParams } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useEffect } from 'react';


export const useProjects = (params?: FetchProjectsParams) => {
    const { notify } = useNotification();

    const query = useQuery({
        queryKey: ['projects', params],
        queryFn: () => projectApi.fetchAll(params).then(r => r.data),
    });

    useEffect(() => {
        if (query.error) {
            notify(getErrorMessage(query.error), 'error');
        }
    }, [query.error, notify]);

    return query;
};

export const useCreateProject = () => {
    const qc = useQueryClient();
    const { notify } = useNotification();


    return useMutation({
        mutationFn: (data: ProjectCreate) => projectApi.create(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['projects'] }),
                notify('Проект успешно создан', 'success');
        },
        onError: (error: Error) => {
            notify(error.message, 'error');
        }
    });
};

export const useUpdateProject = () => {
    const qc = useQueryClient();
    const { notify } = useNotification();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ProjectCreate }) =>
            projectApi.update(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['projects'] });
            notify('Проект успешно обновлён', 'success');
        },
        onError: (error: unknown) => {
            notify(getErrorMessage(error), 'error');
        },
    });
};

export const useDeleteProject = () => {
    const qc = useQueryClient();
    const { notify } = useNotification();

    return useMutation({
        mutationFn: (id: number) => projectApi.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['projects'] });
            notify('Проект удалён', 'success');
        },
        onError: (error: unknown) => {
            notify(getErrorMessage(error), 'error');
        },
    });
};