import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// API helper function
export async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

// GET request helper
export function fetchApi<T>(url: string): Promise<T> {
  return apiRequest<T>(url);
}

// POST request helper
export function postApi<T>(url: string, data: unknown): Promise<T> {
  return apiRequest<T>(url, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// PATCH request helper
export function patchApi<T>(url: string, data: unknown): Promise<T> {
  return apiRequest<T>(url, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// DELETE request helper
export function deleteApi<T>(url: string): Promise<T> {
  return apiRequest<T>(url, {
    method: "DELETE",
  });
}
