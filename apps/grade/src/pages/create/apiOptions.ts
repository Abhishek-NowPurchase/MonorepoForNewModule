import { useState, useEffect } from 'react';
import { mockData } from '../../mockData/create';

// API Options Factory - Plug & Play System
export const createApiOptions = (
    apiKey: string,           // 'gradeCategory', 'tagId', etc.
    valueField: string,       // 'symbol', 'id', etc.
    labelField: string,       // 'name', 'title', etc.
    fallbackData?: any[]      // Optional fallback
) => {
    return async () => {
        // Helper function to wait for data with timeout
        const waitForData = async (timeoutMs: number = 5000): Promise<any> => {
            return new Promise((resolve) => {
                const startTime = Date.now();

                const checkData = () => {
                    const windowData = (window as any)[`${apiKey}Data`];

                    // Check if windowData is an object with results array (most common case)
                    if (windowData && windowData.results && Array.isArray(windowData.results) && windowData.results.length > 0) {
                        resolve(windowData);
                        return;
                    }

                    // Check if windowData is directly an array
                    if (windowData && Array.isArray(windowData) && windowData.length > 0) {
                        resolve(windowData);
                        return;
                    }

                    // Check timeout
                    if (Date.now() - startTime > timeoutMs) {
                        resolve(null);
                        return;
                    }

                    // Continue checking
                    setTimeout(checkData, 100);
                };

                checkData();
            });
        };

        // Wait for data to be available
        const windowData = await waitForData();

        if (windowData) {
            // Check if windowData is an object with results array
            if (windowData.results && Array.isArray(windowData.results)) {
                return windowData.results.map((item: any) => ({
                    value: item[valueField],
                    label: item[labelField]
                }));
            }

            // Check if windowData is directly an array
            if (Array.isArray(windowData)) {
                return windowData.map((item: any) => ({
                    value: item[valueField],
                    label: item[labelField]
                }));
            }
        }

        // Fallback to provided data or mock
        if (fallbackData) {
            return fallbackData;
        }

        // Try to find in mockData
        const mockKey = `${apiKey}s`; // gradeCategory -> gradeCategorys
        if (mockData[mockKey]) {
            return mockData[mockKey];
        }

        return [];
    };
};

// Auto-Data Manager - Handles all API calls and window storage
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

    // Initialize loading states
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

                    // Store in window for options access
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

