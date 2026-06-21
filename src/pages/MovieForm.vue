<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import { moviesApi } from '../api/services';

const props = defineProps<{ mode: 'create' | 'edit' }>();

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);

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
  if (!form.title) errors.title = 'Tytuł jest wymagany';
  else if (form.title.length > 200) errors.title = 'Maksymalnie 200 znaków';
  else errors.title = '';

  const year = Number(form.year);
  if (!form.year) errors.year = 'Rok jest wymagany';
  else if (year < 1888) errors.year = 'Najwcześniej 1888';
  else if (year > 2100) errors.year = 'Zbyt odległy rok';
  else errors.year = '';

  if (form.duration_minutes && Number(form.duration_minutes) < 1)
    errors.duration_minutes = 'Musi być dodatni';
  else errors.duration_minutes = '';

  return !errors.title && !errors.year && !errors.duration_minutes;
}

async function onSubmit() {
  if (!validate()) return;
  submitting.value = true;
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
  <div class="card mx-auto" style="max-width: 560px">
    <div class="card-body">
      <h1 class="h4 mb-3">{{ props.mode === 'create' ? 'Dodaj film / serial' : 'Edytuj' }}</h1>
      <form @submit.prevent="onSubmit" novalidate>
        <div class="mb-3">
          <label class="form-label">Tytuł *</label>
          <input v-model="form.title" class="form-control" :class="{ 'is-invalid': errors.title }" />
          <div class="invalid-feedback">{{ errors.title }}</div>
        </div>

        <div class="row">
          <div class="col mb-3">
            <label class="form-label">Rok *</label>
            <input v-model="form.year" type="number" class="form-control" :class="{ 'is-invalid': errors.year }" />
            <div class="invalid-feedback">{{ errors.year }}</div>
          </div>
          <div class="col mb-3">
            <label class="form-label">Typ</label>
            <select v-model="form.media_type" class="form-select">
              <option value="movie">Film</option>
              <option value="series">Serial</option>
            </select>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Reżyser</label>
          <input v-model="form.director" class="form-control" />
        </div>

        <div class="row">
          <div class="col mb-3">
            <label class="form-label">Gatunek</label>
            <input v-model="form.genre" class="form-control" />
          </div>
          <div class="col mb-3">
            <label class="form-label">Czas (min)</label>
            <input v-model="form.duration_minutes" type="number" class="form-control" :class="{ 'is-invalid': errors.duration_minutes }" />
            <div class="invalid-feedback">{{ errors.duration_minutes }}</div>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Kraj</label>
          <input v-model="form.country" class="form-control" />
        </div>

        <div class="mb-3">
          <label class="form-label">Opis</label>
          <textarea v-model="form.description" class="form-control" rows="4"></textarea>
        </div>

        <div class="d-flex gap-2 justify-content-end">
          <button type="button" class="btn btn-outline-secondary" @click="router.back()">Anuluj</button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? 'Zapisywanie...' : 'Zapisz' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
