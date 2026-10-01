"use client";

/**
 * useApi — Custom hook untuk client-side data fetching dengan token auth.
 *
 * Fitur:
 * - Fetch otomatis saat komponen mount (atau saat `endpoint` berubah)
 * - State: data, loading, error
 * - Fungsi `refetch()` untuk trigger ulang secara manual
 * - Skip fetch jika `endpoint` null/undefined (berguna untuk conditional fetching)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/apiClient";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiResult<T> extends UseApiState<T> {
  refetch: () => void;
}

/**
 * Hook untuk GET request dengan auth token otomatis.
 *
 * @param endpoint - Path API, e.g. `/api/fasil/sesi`. Pass `null` untuk skip fetch.
 *
 * @example
 * const { data, loading, error, refetch } = useApi<SesiResponse>("/api/fasil/sesi");
 */
export function useApi<T = unknown>(
  endpoint: string | null | undefined
): UseApiResult<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: Boolean(endpoint),
    error: null,
  });

  // Pakai ref untuk track apakah komponen masih mounted
  // supaya tidak set state setelah unmount
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Counter untuk trigger refetch secara manual
  const [fetchCount, setFetchCount] = useState(0);
  const refetch = useCallback(() => setFetchCount((c) => c + 1), []);

  useEffect(() => {
    if (!endpoint) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    let cancelled = false;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    api
      .get<T>(endpoint)
      .then((data) => {
        if (!cancelled && isMounted.current) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled && isMounted.current) {
          const message =
            err instanceof Error ? err.message : "Terjadi kesalahan.";
          setState({ data: null, loading: false, error: message });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, fetchCount]);

  return { ...state, refetch };
}

/**
 * Hook untuk mutasi (POST/PUT/PATCH/DELETE) dengan token auth otomatis.
 *
 * Mengembalikan fungsi `mutate` yang dipanggil secara manual (bukan saat mount).
 *
 * @example
 * const { mutate, loading, error } = useMutation<SesiResponse>("POST", "/api/fasil/sesi");
 * // lalu di event handler:
 * const result = await mutate({ nama_sesi: "Sesi Malam" });
 */
export function useMutation<T = unknown>(
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  endpoint: string
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (
      body?: Record<string, unknown> | FormData
    ): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        let result: T;
        if (method === "DELETE") {
          result = await api.delete<T>(endpoint);
        } else if (method === "PUT") {
          result = await api.put<T>(endpoint, body);
        } else if (method === "PATCH") {
          result = await api.patch<T>(endpoint, body);
        } else {
          result = await api.post<T>(endpoint, body);
        }
        return result;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Terjadi kesalahan.";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [method, endpoint]
  );

  return { mutate, loading, error };
}
