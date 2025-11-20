import { useState, useEffect } from "react";

/**
 * React hook that debounces a value
 * Useful for debouncing search inputs, API calls, etc.
 * 
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 300)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

