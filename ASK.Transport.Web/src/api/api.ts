import axios from 'axios';
import { handleMockRouter, isOfflineOrHttpsLocalhost } from './mockApiRouter';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:5208/api';

// =============================================================================
// GLOBAL AXIOS INTERCEPTOR
// Intercepts all network errors, mixed-content blocks, and offline states
// across all components and returns realistic transport registry mock data.
// =============================================================================

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetError =
      error?.code === 'ERR_NETWORK' ||
      error?.message?.includes('Network Error') ||
      !error?.response ||
      error?.response?.status === 404 ||
      error?.response?.status === 500;

    if (isNetError || isOfflineOrHttpsLocalhost(API_ROOT)) {
      const url = error?.config?.url || '';
      const method = (error?.config?.method || 'get').toUpperCase();
      let body = error?.config?.data;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          // keep as string
        }
      }

      console.warn(`[Axios Interceptor] Gracefully resolved offline/network error on ${method} ${url}`);
      const mock = handleMockRouter(url, method, body);

      return Promise.resolve({
        data: mock.data,
        status: mock.status,
        statusText: 'OK',
        headers: {},
        config: error.config || {}
      });
    }

    return Promise.reject(error);
  }
);

// =============================================================================
// TOKEN STORAGE UTILITIES (SESSION-FIRST SECURITY)
// =============================================================================
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('token') || localStorage.getItem('token');
}

export function clearAuthStorage(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

// =============================================================================
// CENTRAL FETCH REQUEST WRAPPER
// =============================================================================

export async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();

  // If deployed on HTTPS (e.g. Vercel) and API points to localhost, immediately use local registry
  if (isOfflineOrHttpsLocalhost(API_ROOT)) {
    console.info(`[Offline Registry] Instantly resolving ${method} ${url}`);
    const mock = handleMockRouter(url, method, options.body);
    return mock.data as T;
  }

  const token = getAuthToken();
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const fullUrl = `${API_ROOT}${url}`;
  console.log('API REQUEST:', fullUrl);

  let response: Response;

  try {
    response = await fetch(fullUrl, {
      ...options,
      headers
    });
  } catch (netErr) {
    console.warn(`[Fetch Fallback] Network failed on ${fullUrl}, falling back to local transport registry:`, netErr);
    const mock = handleMockRouter(url, method, options.body);
    return mock.data as T;
  }

  const contentType = response.headers.get('content-type') || '';
  const responseText = await response.text();

  if (!response.ok) {
    if (
      response.status === 401 &&
      !url.includes('/Auth/login') &&
      !url.includes('/Token/logout')
    ) {
      if (token && token.startsWith('demo-')) {
        console.warn('Demo / Fallback session received 401, preserving local session.');
        const mock = handleMockRouter(url, method, options.body);
        return mock.data as T;
      }

      clearAuthStorage();

      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        const isAdmin = window.location.pathname.startsWith('/admin');
        window.location.href = isAdmin ? '/login?portal=admin&expired=1' : '/login?expired=1';
      }
      throw new Error('Your session has expired. Please sign in again.');
    }

    // On 404 or 500, provide graceful fallback instead of crashing
    if (response.status === 404 || response.status >= 500) {
      console.warn(`[HTTP ${response.status}] Endpoint ${url} returned server error. Serving local registry mock:`);
      const mock = handleMockRouter(url, method, options.body);
      return mock.data as T;
    }

    let message = `Request failed (${response.status})`;

    if (contentType.includes('application/json') && responseText) {
      try {
        const errorData = JSON.parse(responseText);
        message = errorData.message || errorData.title || errorData.detail || message;
        if (errorData.errors) {
          const validationMessages = Object.values(errorData.errors).flat().join(' ');
          if (validationMessages) message = validationMessages;
        }
      } catch {
        message = responseText || message;
      }
    } else if (responseText) {
      message = responseText;
    }

    throw new Error(message);
  }

  if (!responseText) {
    return undefined as T;
  }

  if (!contentType.includes('application/json')) {
    // If server returned HTML (e.g. 404 page from Vercel rewrite), serve mock
    console.warn(`Expected JSON but received ${contentType} on ${url}, returning mock response:`);
    const mock = handleMockRouter(url, method, options.body);
    return mock.data as T;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    const mock = handleMockRouter(url, method, options.body);
    return mock.data as T;
  }
}

export function get<T>(url: string) {
  return request<T>(url);
}

export function post<T>(url: string, body?: unknown) {
  return request<T>(url, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
}

export function put<T>(url: string, body?: unknown) {
  return request<T>(url, {
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
}

export function del<T>(url: string) {
  return request<T>(url, {
    method: 'DELETE'
  });
}
