import { useState, useCallback } from 'react';

// Custom JSON parser with date revival to ensure Date objects are correctly parsed from localStorage
const JSON_parse_with_dates = (value: string | null) => {
  if (value === null) return null;
  try {
    return JSON.parse(value, (key, val) => {
        // This regex checks for the specific ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
        if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(val)) {
            return new Date(val);
        }
        return val;
    });
  } catch {
    // If parsing fails, return the original value
    return value;
  }
};

/**
 * A custom React hook that syncs state with the browser's localStorage.
 * It behaves like `useState` but automatically persists the state.
 * @param key The key to use for storing the value in localStorage.
 * @param initialValue The initial value to use if nothing is stored.
 * @returns A stateful value, and a function to update it.
 */
export function usePersistentState<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue) {
        // Use the custom parser to handle dates correctly
        return JSON_parse_with_dates(storedValue) as T;
      }
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
    }
    // Return initial value if nothing is stored or an error occurs
    return initialValue;
  });

  // A memoized version of the setter function to update both state and localStorage
  const setPersistentState = useCallback((newValue: T | ((val: T) => T)) => {
    setState(prevState => {
      // Allow for function updates, similar to useState's setter
      const valueToStore = newValue instanceof Function ? newValue(prevState) : newValue;
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key “${key}”:`, error);
      }
      return valueToStore;
    });
  }, [key]);

  return [state, setPersistentState];
}