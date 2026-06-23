import { ref } from 'vue';
import { authApi, type User } from '../api/services';

const user = ref<User | null>(null);
const loading = ref(true);

async function refreshUser() {
  try {
    user.value = await authApi.me();
  } catch {
    user.value = null;
    authApi.logout();
  }
}

async function init() {
  const token = localStorage.getItem('token');
  if (token) {
    await refreshUser();
  }
  loading.value = false;
}

async function login(username: string, password: string) {
  await authApi.login(username, password);
  await refreshUser();
}

function logout() {
  authApi.logout();
  user.value = null;
  // Twarde przekierowanie — gwarantuje że stan aplikacji się zresetuje
  window.location.href = '/login';
}

export function useAuth() {
  return { user, loading, login, logout, refreshUser, init };
}