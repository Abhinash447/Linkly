// Use localhost only for local development; deployed builds must configure their API URL.
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? "http://localhost:8000" : ""))?.replace(/\/+$/, "") ||
  "";

export async function api(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error("Set VITE_API_URL to your backend URL before deploying.");
  }

  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,

    headers: {
      "Content-Type": "application/json",

      ...(token && {
        Authorization: `Bearer ${token}`,
      }),

      ...options.headers,
    },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Express may return an HTML 404 page, so preserve the HTTP status when no JSON message exists.
    const error = new Error(
      body.message ||
        body.error ||
        `Request failed (${res.status}${res.statusText ? ` ${res.statusText}` : ""})`,
    );
    error.status = res.status;
    throw error;
  }

  return body.data ?? body;
}
