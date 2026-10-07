import * as SecureStore from 'expo-secure-store';
import { API_BASE } from './config';

const TOKEN_KEY = 'ecollect_token';
const ROLE_KEY = 'ecollect_role';
let onUnauthorized = null;

export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };
export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const saveToken = (t) => SecureStore.setItemAsync(TOKEN_KEY, t);
export const getRole = () => SecureStore.getItemAsync(ROLE_KEY);
export const saveRole = (r) => SecureStore.setItemAsync(ROLE_KEY, r);
export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(ROLE_KEY);
}

/**
 * Calls the PHP API. Throws Error(message) with a user-readable message.
 * Pass { auth: false } for public endpoints (login, register, zones).
 */
export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  let res;
  try {
    res = await fetch(`${API_BASE}/${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    throw new Error(
      e.name === 'AbortError'
        ? 'The server took too long to respond. Try again.'
        : 'Cannot reach the server. Check that XAMPP is running, your phone is on the same Wi-Fi, and API_BASE in src/config.js is correct.'
    );
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    throw new Error('The server sent an unexpected response. Check that MySQL is running.');
  }

  if (res.status === 401 && auth && onUnauthorized) onUnauthorized();
  if (!res.ok) throw new Error(data?.error || 'Something went wrong. Try again.');
  return data;
}
