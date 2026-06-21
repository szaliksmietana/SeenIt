<script setup lang="ts">
import { ref, reactive } from 'vue';
import { toast } from 'vue3-toastify';
import { authApi } from '../api/services';
import { useAuth } from '../stores/auth';

const { user, refreshUser } = useAuth();

// Wypełniamy formularz aktualnymi danymi użytkownika.
const form = reactive({
  full_name: user.value?.full_name || '',
  email: user.value?.email || '',
});
const errors = reactive({ email: '' });
const submitting = ref(false);

function validate(): boolean {
  if (!form.email) errors.email = 'Email jest wymagany';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Nieprawidłowy email';
  else errors.email = '';
  return !errors.email;
}

async function onSubmit() {
  if (!validate()) return;
  submitting.value = true;
  try {
    await authApi.updateProfile({ full_name: form.full_name, email: form.email });
    await refreshUser();
    toast.success('Profil zaktualizowany');
  } catch (err: any) {
    toast.error(err.message);
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="form-card">
    <h1>Profil</h1>
    <p class="muted">Zalogowany jako <strong>{{ user?.username }}</strong></p>

    <form @submit.prevent="onSubmit" novalidate>
      <div class="field">
        <label>Imię i nazwisko</label>
        <input v-model="form.full_name" />
      </div>
      <div class="field">
        <label>Email</label>
        <input v-model="form.email" type="email" />
        <span v-if="errors.email" class="error">{{ errors.email }}</span>
      </div>
      <button type="submit" class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Zapisywanie...' : 'Zapisz zmiany' }}
      </button>
    </form>
  </div>
</template>
