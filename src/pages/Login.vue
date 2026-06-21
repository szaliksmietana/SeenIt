<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import { useAuth } from '../stores/auth';

const { login } = useAuth();
const router = useRouter();

// Dane formularza (reaktywne — powiązane z polami przez v-model).
const form = reactive({ username: '', password: '' });
// Błędy walidacji dla każdego pola.
const errors = reactive({ username: '', password: '' });
const submitting = ref(false);

// Sprawdza pola i wypełnia errors. Zwraca true, jeśli wszystko OK.
function validate(): boolean {
  errors.username = form.username ? '' : 'Pole wymagane';
  errors.password = form.password ? '' : 'Pole wymagane';
  return !errors.username && !errors.password;
}

async function onSubmit() {
  if (!validate()) return;
  submitting.value = true;
  try {
    await login(form.username, form.password);
    toast.success('Zalogowano!');
    router.push('/movies');
  } catch (err: any) {
    toast.error(err.message || 'Błąd logowania');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="auth-card">
    <h1>Logowanie</h1>
    <p class="hint">
      Admin: <strong>admin</strong> / <strong>Admin1234</strong><br />
      Zwykły użytkownik: <strong>demo</strong> / <strong>Demo1234</strong>
    </p>

    <!-- @submit.prevent = obsłuż wysłanie formularza, ale nie przeładowuj strony. -->
    <form @submit.prevent="onSubmit" novalidate>
      <div class="field">
        <label>Nazwa użytkownika</label>
        <input v-model="form.username" autocomplete="username" />
        <span v-if="errors.username" class="error">{{ errors.username }}</span>
      </div>

      <div class="field">
        <label>Hasło</label>
        <input v-model="form.password" type="password" autocomplete="current-password" />
        <span v-if="errors.password" class="error">{{ errors.password }}</span>
      </div>

      <button type="submit" class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Logowanie...' : 'Zaloguj się' }}
      </button>
    </form>

    <p class="switch">Nie masz konta? <RouterLink to="/register">Zarejestruj się</RouterLink></p>
  </div>
</template>
