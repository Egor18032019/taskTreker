import axios from 'axios';

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (typeof data === 'string') return data;
  }
  if (error instanceof Error) return error.message;
  return 'Произошла неизвестная ошибка';
};