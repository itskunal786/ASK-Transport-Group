const API_ROOT =
  import.meta.env.VITE_API_ROOT || 'http://localhost:5208/api';

export async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

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
  } catch {
    throw new Error(
      'Backend connection failed. Make sure API is running on port 5208.'
    );
  }

  const contentType =
    response.headers.get('content-type') || '';

  const responseText = await response.text();

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    if (
      contentType.includes('application/json') &&
      responseText
    ) {
      try {
        const errorData = JSON.parse(responseText);

        message =
          errorData.message ||
          errorData.title ||
          errorData.detail ||
          message;

        if (errorData.errors) {
          const validationMessages = Object.values(
            errorData.errors
          )
            .flat()
            .join(' ');

          if (validationMessages) {
            message = validationMessages;
          }
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
    console.error(
      'Expected JSON but received:',
      contentType,
      responseText.substring(0, 200)
    );

    throw new Error(
      'API returned an invalid response. Check backend URL.'
    );
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw new Error(
      'Could not read API response.'
    );
  }
}

export function get<T>(url: string) {
  return request<T>(url);
}

export function post<T>(
  url: string,
  body?: unknown
) {
  return request<T>(url, {
    method: 'POST',
    body:
      body !== undefined
        ? JSON.stringify(body)
        : undefined
  });
}

export function put<T>(
  url: string,
  body?: unknown
) {
  return request<T>(url, {
    method: 'PUT',
    body:
      body !== undefined
        ? JSON.stringify(body)
        : undefined
  });
}

export function del<T>(url: string) {
  return request<T>(url, {
    method: 'DELETE'
  });
}
