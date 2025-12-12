import { createContext } from 'react';

// Create context to pass onDataChange callback to child components
export const DataChangeContext = createContext<((data: any) => void) | null>(null);

