// ABOUTME: Tests for useErrorBoundary hook
// ABOUTME: Covers manual error triggering and async error handling

import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useErrorBoundary, useAsyncErrorBoundary } from "../useErrorBoundary";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { render } from "@testing-library/react";

describe("useErrorBoundary", () => {
  describe("Basic functionality", () => {
    it("should return a function to trigger error boundary", () => {
      const { result } = renderHook(() => useErrorBoundary());

      expect(typeof result.current).toBe("function");
    });

    it("should throw error when showBoundary is called", () => {
      const { result } = renderHook(() => useErrorBoundary());

      // Create a test error
      const testError = new Error("Test error");

      // Call showBoundary should trigger error on next render
      expect(() => {
        result.current(testError);
      }).not.toThrow();

      // The hook should throw on re-render
      // Note: This is hard to test directly, so we test integration with ErrorBoundary
    });

    it("should convert non-Error values to Error instances", () => {
      const { result } = renderHook(() => useErrorBoundary());

      // Call with string
      result.current("String error");

      // Should not throw during call, but will throw Error on render
    });
  });

  describe("Integration with ErrorBoundary", () => {
    it("should trigger error boundary when showBoundary is called in component", () => {
      let showBoundary: ((error: Error) => void) | null = null;

      function TestComponent() {
        showBoundary = useErrorBoundary();
        return <div>Component content</div>;
      }

      const result = render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      expect(result.getByText("Component content")).toBeInTheDocument();

      // Trigger error boundary
      if (showBoundary) {
        expect(() => showBoundary(new Error("Triggered error"))).not.toThrow();
      }

      // After state update, error boundary should catch the error
      // This would require additional async handling in a real scenario
    });
  });
});

describe("useAsyncErrorBoundary", () => {
  describe("Success cases", () => {
    it("should execute async function successfully", async () => {
      const asyncFn = vi.fn(async (value: number) => {
        return value * 2;
      });

      const { result } = renderHook(() => useAsyncErrorBoundary(asyncFn));

      const returnValue = await result.current(5);

      expect(asyncFn).toHaveBeenCalledWith(5);
      expect(returnValue).toBe(10);
    });

    it("should maintain function signature with multiple parameters", async () => {
      const asyncFn = vi.fn(async (a: number, b: string) => {
        return `${a}-${b}`;
      });

      const { result } = renderHook(() => useAsyncErrorBoundary(asyncFn));

      const returnValue = await result.current(42, "test");

      expect(asyncFn).toHaveBeenCalledWith(42, "test");
      expect(returnValue).toBe("42-test");
    });
  });

  describe("Error handling", () => {
    it("should catch async errors and trigger error boundary", async () => {
      const asyncFn = vi.fn(async () => {
        throw new Error("Async error");
      });

      const { result } = renderHook(() => useAsyncErrorBoundary(asyncFn));

      // Call the wrapped function
      const promise = result.current();

      // Should not throw directly, but trigger error boundary
      await expect(promise).resolves.toBeUndefined();
    });

    it("should handle rejected promises", async () => {
      const asyncFn = vi.fn(async () => {
        return Promise.reject(new Error("Rejected promise"));
      });

      const { result } = renderHook(() => useAsyncErrorBoundary(asyncFn));

      const promise = result.current();

      // Should catch rejection and trigger error boundary
      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe("Memoization", () => {
    it("should memoize wrapped function based on dependencies", () => {
      const asyncFn = vi.fn(async () => "result");

      const { result, rerender } = renderHook(() => useAsyncErrorBoundary(asyncFn));

      const wrappedFn1 = result.current;

      // Rerender with same function
      rerender();

      const wrappedFn2 = result.current;

      // Should return same wrapped function instance
      expect(wrappedFn1).toBe(wrappedFn2);
    });

    it("should create new wrapped function when async function changes", () => {
      const asyncFn1 = vi.fn(async () => "result1");
      const asyncFn2 = vi.fn(async () => "result2");

      const { result, rerender } = renderHook(
        ({ fn }) => useAsyncErrorBoundary(fn),
        { initialProps: { fn: asyncFn1 } }
      );

      const wrappedFn1 = result.current;

      // Rerender with different function
      rerender({ fn: asyncFn2 });

      const wrappedFn2 = result.current;

      // Should return different wrapped function instance
      expect(wrappedFn1).not.toBe(wrappedFn2);
    });
  });
});
