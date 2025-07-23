// ABOUTME: Utility functions for MSW testing setup and request validation
// ABOUTME: Provides helpers for common MSW testing patterns and Supabase API expectations

import { expect } from "vitest";

/**
 * Validates that a request has the expected Supabase headers
 */
export const validateSupabaseRequest = (request: Request) => {
  expect(request.headers.get("apikey")).toBeDefined();
  expect(request.headers.get("Authorization")).toBeDefined();
  expect(request.url).toContain("/rest/v1/");
};

/**
 * Validates that a request uses the expected HTTP method
 */
export const validateHttpMethod = (
  request: Request,
  expectedMethod: string
) => {
  expect(request.method).toBe(expectedMethod.toUpperCase());
};

/**
 * Validates that a request targets the expected table
 */
export const validateTableTarget = (
  request: Request,
  expectedTable: string
) => {
  expect(request.url).toContain(`/rest/v1/${expectedTable}`);
};

/**
 * Validates that a request has the correct content type for JSON payloads
 */
export const validateJsonContentType = (request: Request) => {
  expect(request.headers.get("Content-Type")).toContain("application/json");
};

/**
 * Validates that a request expects a single object response (has .single() modifier)
 */
export const validateSingleObjectRequest = (request: Request) => {
  const acceptHeader = request.headers.get("Accept");
  expect(acceptHeader).toContain("application/vnd.pgrst.object+json");
};

/**
 * Helper to extract query parameters from Supabase REST API requests
 */
export const extractSupabaseQueryParams = (request: Request) => {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);

  return {
    select: params.get("select"),
    filter: Object.fromEntries(
      [...params.entries()].filter(([key]) => key !== "select")
    ),
    limit: params.get("limit") ? parseInt(params.get("limit")!, 10) : null,
    order: params.get("order"),
  };
};

/**
 * Helper to create Supabase-style error responses
 */
export const createSupabaseErrorResponse = (
  code: string,
  message: string,
  status: number,
  details?: string
) => {
  return {
    error: {
      code,
      message,
      details: details || message,
      hint: null,
    },
  };
};

/**
 * Common patterns for Supabase filter parsing
 */
export const parseSupabaseFilter = (
  filterParam: string | null
): { column: string; operator: string; value: string } | null => {
  if (!filterParam) return null;

  // Handle eq.value pattern
  const eqMatch = filterParam.match(/^eq\.(.+)$/);
  if (eqMatch) {
    return { column: "", operator: "eq", value: eqMatch[1] };
  }

  // Handle other operators if needed
  return null;
};

/**
 * Helper to wait for MSW handlers to process (useful in async tests)
 */
export const waitForMSW = () =>
  new Promise((resolve) => setTimeout(resolve, 0));
