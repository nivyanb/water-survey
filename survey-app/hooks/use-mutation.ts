"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface MutationResult<T> {
  data:  T | null;
  error: string | null;
}

interface MutationState<T> {
  mutate:  (body?: any) => Promise<MutationResult<T>>;
  loading: boolean;
  error:   string | null;
  data:    T | null;
}

export const useMutation = <T = any>(path: string, method = "POST"): MutationState<T> => {
  const [data,    setData]    = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const mutate = async (body?: any): Promise<MutationResult<T>> => {
    setLoading(true);
    setError(null);

    try {
      const res  = await fetch(`${API_URL}${path}`, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = await res.json();

      if (!res.ok || !json.success) throw new Error(json.error ?? `Request failed: ${res.status}`);

      setData(json.data);
      return { data: json.data, error: null };
    } catch (err: any) {
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error, data };
};
