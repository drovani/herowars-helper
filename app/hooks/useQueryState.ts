import { useCallback } from "react";
import { useSearchParams } from "react-router";

export function useQueryState<T extends string>(
  key: string,
  defaultValue: T,
  replaceState: boolean = true
): [T, (value: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = (searchParams.get(key) as T) || defaultValue;

  const setValue = useCallback(
    (newValue: T) => {
      const newParams = new URLSearchParams(searchParams);

      if (newValue === defaultValue) {
        newParams.delete(key);
      } else {
        newParams.set(key, newValue);
      }

      setSearchParams(newParams, { replace: replaceState });
    },
    [key, defaultValue, searchParams, setSearchParams]
  );

  return [value, setValue];
}
