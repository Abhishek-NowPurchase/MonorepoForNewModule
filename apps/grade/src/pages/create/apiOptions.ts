import { useState, useEffect } from 'react';

export const createApiOptions = (
    apiKey: string,
    valueField: string,
    labelField: string,
    fallbackData?: any[]
) => {
    return async () => {
        const waitForData = async (timeoutMs: number = 5000): Promise<any> => {
            return new Promise((resolve) => {
                const startTime = Date.now();

                const checkData = () => {
                    const windowData = (window as any)[`${apiKey}Data`];

                    if (windowData && windowData.results && Array.isArray(windowData.results) && windowData.results.length > 0) {
                        resolve(windowData);
                        return;
                    }

                    if (windowData && Array.isArray(windowData) && windowData.length > 0) {
                        resolve(windowData);
                        return;
                    }

                    if (Date.now() - startTime > timeoutMs) {
                        resolve(null);
                        return;
                    }

                    setTimeout(checkData, 100);
                };

                checkData();
            });
        };

        const windowData = await waitForData();

        if (windowData) {
            if (windowData.results && Array.isArray(windowData.results)) {
                return windowData.results.map((item: any) => ({
                    value: item[valueField],
                    label: item[labelField]
                }));
            }

            if (Array.isArray(windowData)) {
                return windowData.map((item: any) => ({
                    value: item[valueField],
                    label: item[labelField]
                }));
            }
        }

        if (fallbackData) {
            return fallbackData;
        }

        return [];
    };
};

export const useApiDataManager = (apiConfigs: Array<{
    key: string;
    apiFunction: () => Promise<any>;
    autoSelect?: boolean;
    selectField?: string;
}>) => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState({});
    const [error, setError] = useState({});
    const [hasFetched, setHasFetched] = useState({});

    apiConfigs.forEach(config => {
        if (loading[config.key] === undefined) {
            loading[config.key] = true;
            hasFetched[config.key] = false;
        }
    });

    useEffect(() => {
        const fetchAllData = async () => {
            const promises = apiConfigs.map(async (config) => {
                if (hasFetched[config.key]) return;

                try {
                    const result = await config.apiFunction();

                    setData(prev => ({ ...prev, [config.key]: result }));
                    setLoading(prev => ({ ...prev, [config.key]: false }));
                    setHasFetched(prev => ({ ...prev, [config.key]: true }));

                    if (typeof window !== 'undefined') {
                        (window as any)[`${config.key}Data`] = result;
                    }
                } catch (err) {
                    setError(prev => ({ ...prev, [config.key]: err }));
                    setLoading(prev => ({ ...prev, [config.key]: false }));
                    setHasFetched(prev => ({ ...prev, [config.key]: false }));
                }
            });

            await Promise.all(promises);
        };

        fetchAllData();
    }, []);

    return { data, loading, error };
};

