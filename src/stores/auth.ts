import { ref } from 'vue';
import { authApi, type User } from '../api/services';

// ─────────────────────────────────────────────────────────────────────────────
// Globalny stan logowania (odpowiednik AuthContext z React).
// Te zmienne są zadeklarowane raz, na poziomie pliku — więc są WSPÓLNE
// dla całej aplikacji. Każdy komponent, który zaimportuje useAuth(),
// widzi tego samego użytkownika.
// ─────────────────────────────────────────────────────────────────────────────

// ref(...) tworzy zmienną "reaktywną" — gdy ją zmienisz, widok sam się odświeży.
const user = ref<User | null>(null);
const loading = ref(true);

// Pobiera dane zalogowanego użytkownika z API i zapisuje w stanie.
async function refreshUser() {
  try {
    user.value = await authApi.me();
  } catch {
    user.value = null;
    authApi.logout();
  }
}

// Wywoływane raz przy starcie aplikacji (w main.ts).
// Jeśli jest token w localStorage, dociąga użytkownika.
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
}

// Komponenty wołają useAuth(), żeby dostać dostęp do stanu i akcji.
export function useAuth() {
  return { user, loading, login, logout, refreshUser, init };
}
