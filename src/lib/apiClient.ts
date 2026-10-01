/**
 * apiClient — Fetch wrapper untuk semua request ke backend.
 *
 * Fitur:
 * - Auto-attach header `Authorization: Bearer <token>` dari localStorage
 * - Handle 401: hapus token lama dan redirect ke /login
 * - Melempar Error dengan message dari response JSON (field `message`)
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.port === "3000"
    ? "http://127.0.0.1:5000"
    : "");

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown> | FormData | null;
};

/**
 * Ambil token dari localStorage (hanya di browser).
 */
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

/**
 * Hapus semua data auth dan redirect ke halaman login.
 */
function handleUnauthorized(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

/**
 * Core fetch wrapper.
 *
 * @param endpoint - Path relatif, e.g. `/api/fasil/sesi`
 * @param options  - RequestInit standar + body boleh berupa plain object
 */
async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    ...(options.headers as Record<string, string>),
  };

  // Attach token kalau ada
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  // Serialisasi body: plain object → JSON, FormData → biarkan browser yang set Content-Type
  let body: BodyInit | null | undefined = undefined;
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body != null) {
    body = JSON.stringify(options.body);
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    body,
  });

  // 401 → session habis / token tidak valid, paksa login ulang
  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Sesi telah berakhir. Silakan login kembali.");
  }

  // Coba parse JSON; kalau response kosong (204, dll.) kembalikan null
  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const message =
      (data as { message?: string } | null)?.message ??
      `Request gagal dengan status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

// ─── Shorthand helpers ────────────────────────────────────────────────────────

export const api = {
  get: <T = unknown>(endpoint: string, options?: Omit<RequestOptions, "body">) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(
    endpoint: string,
    body?: Record<string, unknown> | FormData,
    options?: Omit<RequestOptions, "body">
  ) => apiClient<T>(endpoint, { ...options, method: "POST", body }),

  put: <T = unknown>(
    endpoint: string,
    body?: Record<string, unknown> | FormData,
    options?: Omit<RequestOptions, "body">
  ) => apiClient<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T = unknown>(
    endpoint: string,
    body?: Record<string, unknown> | FormData,
    options?: Omit<RequestOptions, "body">
  ) => apiClient<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T = unknown>(endpoint: string, options?: Omit<RequestOptions, "body">) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};

export default apiClient;
