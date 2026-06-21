<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import { useAuth } from '../stores/auth';

const { login } = useAuth();
const router = useRouter();

const form = reactive({ username: '', password: '' });
const errors = reactive({ username: '', password: '' });
const submitting = ref(false);

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
  <div class="card mx-auto" style="max-width: 440px">
    <div class="card-body">
      <h1 class="h4 mb-3">Logowanie</h1>
      <p class="text-secondary small">
        Admin: <strong>admin</strong> / <strong>Admin1234</strong><br />
        Zwykły użytkownik: <strong>demo</strong> / <strong>Demo1234</strong>
      </p>

      <form @submit.prevent="onSubmit" novalidate>
        <div class="mb-3">
          <label class="form-label">Nazwa użytkownika</label>
          <input v-model="form.username" class="form-control" :class="{ 'is-invalid': errors.username }" autocomplete="username" />
          <div class="invalid-feedback">{{ errors.username }}</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Hasło</label>
          <input v-model="form.password" type="password" class="form-control" :class="{ 'is-invalid': errors.password }" autocomplete="current-password" />
          <div class="invalid-feedback">{{ errors.password }}</div>
        </div>

        <button type="submit" class="btn btn-primary w-100" :disabled="submitting">
          {{ submitting ? 'Logowanie...' : 'Zaloguj się' }}
        </button>
      </form>

      <p class="text-center text-secondary small mt-3 mb-0">
        Nie masz konta? <RouterLink to="/register">Zarejestruj się</RouterLink>
      </p>
    </div>
  </div>
</template>
