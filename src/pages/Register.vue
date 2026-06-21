<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import { authApi } from '../api/services';

const router = useRouter();

const form = reactive({
  username: '',
  email: '',
  full_name: '',
  password: '',
  confirmPassword: '',
});
const errors = reactive({
  username: '', email: '', password: '', confirmPassword: '',
});
const submitting = ref(false);

// Walidacja wszystkich pól. Każdy warunek ustawia komunikat albo go czyści.
function validate(): boolean {
  // Nazwa użytkownika: min. 3 znaki, tylko litery/cyfry/_/-
  if (!form.username) errors.username = 'Pole wymagane';
  else if (form.username.length < 3) errors.username = 'Minimum 3 znaki';
  else if (!/^[a-zA-Z0-9_-]+$/.test(form.username)) errors.username = 'Tylko litery, cyfry, _ i -';
  else errors.username = '';

  // Email: prosty wzorzec adresu.
  if (!form.email) errors.email = 'Pole wymagane';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Nieprawidłowy email';
  else errors.email = '';

  // Hasło: min. 8 znaków, cyfra i wielka litera.
  if (!form.password) errors.password = 'Pole wymagane';
  else if (form.password.length < 8) errors.password = 'Minimum 8 znaków';
  else if (!/\d/.test(form.password)) errors.password = 'Hasło musi zawierać cyfrę';
  else if (!/[A-Z]/.test(form.password)) errors.password = 'Hasło musi zawierać wielką literę';
  else errors.password = '';

  // Powtórzenie hasła musi się zgadzać.
  if (!form.confirmPassword) errors.confirmPassword = 'Pole wymagane';
  else if (form.confirmPassword !== form.password) errors.confirmPassword = 'Hasła nie są identyczne';
  else errors.confirmPassword = '';

  return !errors.username && !errors.email && !errors.password && !errors.confirmPassword;
}

async function onSubmit() {
  if (!validate()) return;
  submitting.value = true;
  try {
    await authApi.register({
      username: form.username,
      email: form.email,
      password: form.password,
      full_name: form.full_name || undefined,
    });
    toast.success('Konto utworzone! Możesz się zalogować.');
    router.push('/login');
  } catch (err: any) {
    toast.error(err.message || 'Błąd rejestracji');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="auth-card">
    <h1>Rejestracja</h1>
    <form @submit.prevent="onSubmit" novalidate>
      <div class="field">
        <label>Nazwa użytkownika *</label>
        <input v-model="form.username" />
        <span v-if="errors.username" class="error">{{ errors.username }}</span>
      </div>

      <div class="field">
        <label>Email *</label>
        <input v-model="form.email" type="email" />
        <span v-if="errors.email" class="error">{{ errors.email }}</span>
      </div>

      <div class="field">
        <label>Imię i nazwisko</label>
        <input v-model="form.full_name" />
      </div>

      <div class="field">
        <label>Hasło *</label>
        <input v-model="form.password" type="password" />
        <span v-if="errors.password" class="error">{{ errors.password }}</span>
      </div>

      <div class="field">
        <label>Powtórz hasło *</label>
        <input v-model="form.confirmPassword" type="password" />
        <span v-if="errors.confirmPassword" class="error">{{ errors.confirmPassword }}</span>
      </div>

      <button type="submit" class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Tworzenie...' : 'Utwórz konto' }}
      </button>
    </form>
    <p class="switch">Masz już konto? <RouterLink to="/login">Zaloguj się</RouterLink></p>
  </div>
</template>
