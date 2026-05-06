"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3001";

export function getApiBaseUrl(): string {
  return API_BASE_URL.replace(/\/$/, "");
}

export function getErrorMessage(payload: unknown, fallback = "Something went wrong"): string {
  if (!payload) return fallback;

  if (typeof payload === "object" && payload !== null) {
    const p = payload as { error?: unknown; message?: unknown };
    if (typeof p.error === "string") return p.error;
    if (typeof p.message === "string") return p.message;

    if (typeof p.error === "object" && p.error !== null) {
      const errorObj = p.error as { message?: unknown };
      if (typeof errorObj.message === "string") return errorObj.message;
    }
  }

  return fallback;
}

export async function apiRequest<T = unknown>(
  path: string,
  init?: RequestInit & { token?: string }
): Promise<T> {
  const { token, headers, ...rest } = init || {};
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Request failed"));
  }
  return data as T;
}
