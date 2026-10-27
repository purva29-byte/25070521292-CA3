import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 20000,
});

function readCookie(name) {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

let csrfRequest = null;

export async function ensureCsrfToken() {
  const existing = readCookie('unimarket_csrf');
  if (existing) return existing;
  if (!csrfRequest) {
    csrfRequest = api
      .get('/auth/csrf')
      .then((response) => response.data.data.csrfToken)
      .finally(() => {
        csrfRequest = null;
      });
  }
  return csrfRequest;
}

api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const token = await ensureCsrfToken();
    if (token) config.headers['X-CSRF-Token'] = token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (
      error.response?.data?.code === 'CSRF_INVALID' &&
      config &&
      !config._csrfRetried
    ) {
      config._csrfRetried = true;
      await ensureCsrfToken();
      const token = readCookie('unimarket_csrf');
      if (token) config.headers['X-CSRF-Token'] = token;
      return api(config);
    }
    return Promise.reject(error);
  }
);

export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  return (
    error?.response?.data?.message ||
    (error?.code === 'ECONNABORTED' ? 'The request timed out. Please try again.' : null) ||
    (error?.message === 'Network Error'
      ? 'Cannot reach the UniMarket API. Check that the backend is running.'
      : null) ||
    fallback
  );
}

export function getFieldErrors(error) {
  const errors = error?.response?.data?.errors;
  if (!Array.isArray(errors)) return {};
  return errors.reduce((acc, item) => {
    if (item.field && !acc[item.field]) acc[item.field] = item.message;
    return acc;
  }, {});
}

export function getApiCode(error) {
  return error?.response?.data?.code;
}
