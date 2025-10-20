// ABOUTME: useErrorBoundary hook allows components to trigger error boundaries manually
// ABOUTME: Useful for async operations and error handling outside of React's render cycle

import { useState, useCallback } from "react";

/**
 * Hook that provides a function to manually trigger the nearest error boundary.
 *
 * This is useful for:
 * - Async operations (fetch, setTimeout, etc.)
 * - Event handlers that need to propagate errors
 * - Repository errors that should bubble up to UI
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const showBoundary = useErrorBoundary();
 *
 *   const handleClick = async () => {
 *     try {
 *       await riskyOperation();
 *     } catch (error) {
 *       showBoundary(error);
 *     }
 *   };
 *
 *   return <button onClick={handleClick}>Do Something</button>;
 * }
 * ```
 */
export function useErrorBoundary() {
  const [error, setError] = useState<Error | null>(null);

  const showBoundary = useCallback((error: Error | unknown) => {
    const errorInstance = error instanceof Error
      ? error
      : new Error(String(error));

    setError(errorInstance);
  }, []);

  // Throw error to trigger nearest error boundary
  if (error) {
    throw error;
  }

  return showBoundary;
}

/**
 * Hook that wraps an async function with error boundary handling.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const fetchData = useAsyncErrorBoundary(async () => {
 *     const result = await api.getData();
 *     return result;
 *   });
 *
 *   return <button onClick={fetchData}>Load Data</button>;
 * }
 * ```
 */
export function useAsyncErrorBoundary<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T
): T {
  const showBoundary = useErrorBoundary();

  const wrappedFn = useCallback(
    async (...args: Parameters<T>) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        showBoundary(error);
      }
    },
    [asyncFn, showBoundary]
  ) as T;

  return wrappedFn;
}
