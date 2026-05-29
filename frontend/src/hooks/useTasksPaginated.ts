import { keepPreviousData, useQuery  } from '@tanstack/react-query';
import { taskApi } from '../api/taskApi';
import type { FetchTasksPaginatedParams  } from '../types';

export const useTasksPaginated = (params: FetchTasksPaginatedParams) => {


    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['tasks', 'paginated', params],
        queryFn: () => taskApi.fetchPaginated(params).then(r => r.data),
        staleTime: 30 * 1000, // 30 секунд
        placeholderData: keepPreviousData,// показывать старые данные пока грузятся новые
    });

  const pagination = {
    page: data?.page ?? 0,
    size: data?.size ?? 20,
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    hasNext: data?.hasNext ?? false,
    hasPrevious: data?.hasPrevious ?? false,
  };


return {
    tasks: data?.content ?? [],
    pagination,
    isLoading,
    isError,
    refetch,   // если нужно принудительно обновить текущую страницу
  };
};