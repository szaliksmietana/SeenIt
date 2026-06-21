<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import { authApi } from '../api/services';

const router = useRouter();

const form = reactive({
  username: '', email: '', full_name: '', password: '', confirmPassword: '',
});
const errors = reactive({ username: '', email: '', password: '', confirmPassword: '' });
const submitting = ref(false);

function validate(): boolean {
  if (!form.username) errors.username = 'Pole wymagane';
  else if (form.username.length < 3) errors.username = 'Minimum 3 znaki';
  else if (!/^[a-zA-Z0-9_-]+$/.test(form.username)) errors.username = 'Tylko litery, cyfry, _ i -';
  else errors.username = '';

  if (!form.email) errors.email = 'Pole wymagane';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Nieprawidłowy email';
  else errors.email = '';

  if (!form.password) errors.password = 'Pole wymagane';
  else if (form.password.length < 8) errors.password = 'Minimum 8 znaków';
  else if (!/\d/.test(form.password)) errors.password = 'Hasło musi zawierać cyfrę';
  else if (!/[A-Z]/.test(form.password)) errors.password = 'Hasło musi zawierać wielką literę';
  else errors.password = '';

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
  <div class="card mx-auto" style="max-width: 440px">
    <div class="card-body">
      <h1 class="h4 mb-3">Rejestracja</h1>
      <form @submit.prevent="onSubmit" novalidate>
        <div class="mb-3">
          <label class="form-label">Nazwa użytkownika *</label>
          <input v-model="form.username" class="form-control" :class="{ 'is-invalid': errors.username }" />
          <div class="invalid-feedback">{{ errors.username }}</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Email *</label>
          <input v-model="form.email" type="email" class="form-control" :class="{ 'is-invalid': errors.email }" />
          <div class="invalid-feedback">{{ errors.email }}</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Imię i nazwisko</label>
          <input v-model="form.full_name" class="form-control" />
        </div>

        <div class="mb-3">
          <label class="form-label">Hasło *</label>
          <input v-model="form.password" type="password" class="form-control" :class="{ 'is-invalid': errors.password }" />
          <div class="invalid-feedback">{{ errors.password }}</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Powtórz hasło *</label>
          <input v-model="form.confirmPassword" type="password" class="form-control" :class="{ 'is-invalid': errors.confirmPassword }" />
          <div class="invalid-feedback">{{ errors.confirmPassword }}</div>
        </div>

        <button type="submit" class="btn btn-primary w-100" :disabled="submitting">
          {{ submitting ? 'Tworzenie...' : 'Utwórz konto' }}
        </button>
      </form>
      <p class="text-center text-secondary small mt-3 mb-0">
        Masz już konto? <RouterLink to="/login">Zaloguj się</RouterLink>
      </p>
    </div>
  </div>
</template>
