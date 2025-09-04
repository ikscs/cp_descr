// see useFetch
import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';

export function useGet<T>(
    url: string,
    defaultValue: T
) {
    const [data, setData] = useState<T>(defaultValue);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<AxiosError | null>(null);

    useEffect(() => {
        if (!url) {
            setLoading(false);
            return;
        }

        let active = true;

        axios.get<T>(url)
            .then(response => {
                if (active) {
                    setData(response.data);
                }
            })
            .catch((err: AxiosError) => {
                if (active) {
                    setError(err);
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [url]);

    return { data, loading, error, setData };
}