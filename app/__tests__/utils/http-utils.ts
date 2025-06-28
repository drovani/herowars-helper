import { vi } from 'vitest'

export interface MockResponse {
  status: number
  headers: Record<string, string>
  json: () => Promise<any>
  text: () => Promise<string>
}

export function createMockResponse(
  data: any,
  status: number = 200,
  headers: Record<string, string> = { 'Content-Type': 'application/json' }
): Response {
  const response = new Response(JSON.stringify(data), {
    status,
    headers
  })
  
  return response
}

export function createMockRequest(
  url: string,
  options: {
    method?: string
    headers?: Record<string, string>
    body?: FormData | string
  } = {}
): Request {
  // Ensure we have a full URL for the Request constructor
  const fullUrl = url.startsWith('http') ? url : `https://example.com${url}`
  
  return new Request(fullUrl, {
    method: options.method || 'GET',
    headers: options.headers || {},
    body: options.body
  })
}

export function createFormData(data: Record<string, string>): FormData {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return formData
}

export function mockRequestWithAuth(
  url: string,
  options: {
    method?: string
    headers?: Record<string, string>
    body?: FormData | string
    user?: any
  } = {}
): Request {
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${options.user?.access_token || 'mock-token'}`
  }
  
  return createMockRequest(url, {
    ...options,
    headers
  })
}