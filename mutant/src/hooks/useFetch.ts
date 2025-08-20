// хук для начальной загрузки данных
// внутри try - catch
// возвращает 
//   data, данные 
//   loading, состояние загрузки
//   error, ошибка
//
// например
//   const { data: basePrice, loading, error } = useFetch<BasePrice[]>(api.getBasePrice, []);

import { useEffect, useState } from 'react';

export function useFetch<T>(
    apiCall: () => Promise<T>,
    defaultValue: T
) {
    const [data, setData] = useState<T>(defaultValue);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let active = true;

        apiCall()
            .then(result => {
                if (active) setData(result);
            })
            .catch(err => {
                if (active) setError(err instanceof Error ? err : new Error(String(err)));
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [apiCall]);

    return { data, loading, error };
}
