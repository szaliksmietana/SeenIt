<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import { moviesApi } from '../api/services';

// mode przychodzi z routera: 'create' (dodawanie) albo 'edit' (edycja).
const props = defineProps<{ mode: 'create' | 'edit' }>();

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);

// Dane formularza.
const form = reactive({
  title: '',
  year: '' as number | string,
  media_type: 'movie' as 'movie' | 'series',
  director: '',
  genre: '',
  duration_minutes: '' as number | string,
  country: '',
  description: '',
});
const errors = reactive({ title: '', year: '', duration_minutes: '' });
const submitting = ref(false);

// W trybie edycji dociągamy istniejący film i wypełniamy formularz.
onMounted(async () => {
  if (props.mode === 'edit') {
    try {
      const m = await moviesApi.get(id);
      Object.assign(form, {
        title: m.title,
        year: m.year,
        media_type: m.media_type,
        director: m.director ?? '',
        genre: m.genre ?? '',
        duration_minutes: m.duration_minutes ?? '',
        country: m.country ?? '',
        description: m.description ?? '',
      });
    } catch {
      toast.error('Błąd ładowania');
    }
  }
});

function validate(): boolean {
  // Tytuł: wymagany, max 200 znaków.
  if (!form.title) errors.title = 'Tytuł jest wymagany';
  else if (form.title.length > 200) errors.title = 'Maksymalnie 200 znaków';
  else errors.title = '';

  // Rok: wymagany, w zakresie 1888–2100.
  const year = Number(form.year);
  if (!form.year) errors.year = 'Rok jest wymagany';
  else if (year < 1888) errors.year = 'Najwcześniej 1888';
  else if (year > 2100) errors.year = 'Zbyt odległy rok';
  else errors.year = '';

  // Czas trwania (opcjonalny): jeśli podany, musi być dodatni.
  if (form.duration_minutes && Number(form.duration_minutes) < 1)
    errors.duration_minutes = 'Musi być dodatni';
  else errors.duration_minutes = '';

  return !errors.title && !errors.year && !errors.duration_minutes;
}

async function onSubmit() {
  if (!validate()) return;
  submitting.value = true;

  // Przygotowujemy dane: liczby jako liczby, puste pola jako null.
  const payload = {
    title: form.title,
    year: Number(form.year),
    media_type: form.media_type,
    director: form.director || null,
    genre: form.genre || null,
    duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
    country: form.country || null,
    description: form.description || null,
  };

  try {
    if (props.mode === 'create') {
      const created = await moviesApi.create(payload);
      toast.success('Film dodany');
      router.push(`/movies/${created.id}`);
    } else {
      await moviesApi.update(id, payload);
      toast.success('Zapisano zmiany');
      router.push(`/movies/${id}`);
    }
  } catch (err: any) {
    toast.error(err.message || 'Błąd zapisu');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="form-card">
    <h1>{{ props.mode === 'create' ? 'Dodaj film / serial' : 'Edytuj' }}</h1>
    <form @submit.prevent="onSubmit" novalidate>
      <div class="field">
        <label>Tytuł *</label>
        <input v-model="form.title" />
        <span v-if="errors.title" class="error">{{ errors.title }}</span>
      </div>

      <div class="field-row">
        <div class="field">
          <label>Rok *</label>
          <input v-model="form.year" type="number" />
          <span v-if="errors.year" class="error">{{ errors.year }}</span>
        </div>
        <div class="field">
          <label>Typ</label>
          <select v-model="form.media_type">
            <option value="movie">Film</option>
            <option value="series">Serial</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label>Reżyser</label>
        <input v-model="form.director" />
      </div>

      <div class="field-row">
        <div class="field">
          <label>Gatunek</label>
          <input v-model="form.genre" />
        </div>
        <div class="field">
          <label>Czas (min)</label>
          <input v-model="form.duration_minutes" type="number" />
          <span v-if="errors.duration_minutes" class="error">{{ errors.duration_minutes }}</span>
        </div>
      </div>

      <div class="field">
        <label>Kraj</label>
        <input v-model="form.country" />
      </div>

      <div class="field">
        <label>Opis</label>
        <textarea v-model="form.description" rows="4"></textarea>
      </div>

      <div class="form-actions">
        <button type="button" class="btn" @click="router.back()">Anuluj</button>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Zapisywanie...' : 'Zapisz' }}
        </button>
      </div>
    </form>
  </div>
</template>
