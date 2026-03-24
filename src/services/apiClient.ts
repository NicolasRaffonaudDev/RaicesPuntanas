const rawApiUrl = import.meta.env.VITE_API_URL;
if (!rawApiUrl) {
  throw new Error("VITE_API_URL no esta definida. Configura tu .env con la base de la API.");
}

const API_URL = rawApiUrl.replace(/\/+$/, "");
const API_ORIGIN = new URL(API_URL).origin;

interface AuthHandlers {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  refreshSession: () => Promise<string | null>;
  clearSession: () => void;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  retryOn401?: boolean;
}

let authHandlers: AuthHandlers | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const configureApiClientAuth = (handlers: AuthHandlers) => {
  authHandlers = handlers;
};

export const clearApiClientAuth = () => {
  authHandlers = null;
};

const getAuthToken = () => {
  if (!authHandlers) return null;
  return authHandlers.getAccessToken();
};

const tryRefreshSession = async () => {
  if (!authHandlers) return null;
  if (!authHandlers.getRefreshToken()) return null;

  if (!refreshPromise) {
    refreshPromise = authHandlers
      .refreshSession()
      .catch(() => {
        authHandlers?.clearSession();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export const apiRequest = async (path: string, options: RequestOptions = {}): Promise<Response> => {
  const { skipAuth = false, retryOn401 = true, headers, ...rest } = options;
  const requestHeaders = new Headers(headers);

  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
  });

  if (response.status === 401 && !skipAuth && retryOn401 && authHandlers?.getRefreshToken()) {
    const refreshedToken = await tryRefreshSession();
    if (!refreshedToken) {
      return response;
    }

    const retryHeaders = new Headers(headers);
    retryHeaders.set("Authorization", `Bearer ${refreshedToken}`);

    return fetch(`${API_URL}${path}`, {
      ...rest,
      headers: retryHeaders,
    });
  }

  return response;
};

export { API_URL, API_ORIGIN };
