<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import {
	moviesApi,
	watchlistApi,
	reviewsApi,
	type Movie,
	type Review,
} from "../api/services";
import { useAuth } from "../stores/auth";

const route = useRoute();
const router = useRouter();
const { user } = useAuth();
const id = Number(route.params.id);

const movie = ref<Movie | null>(null);
const loading = ref(true);
const reviews = ref<Review[]>([]);
const myReview = ref<Review | null>(null);

const form = reactive({ rating: 8, content: "" });
const savingReview = ref(false);

async function loadAll() {
	try {
		movie.value = await moviesApi.get(id);
		reviews.value = await reviewsApi.listForMovie(id);
		// Pobieramy własną recenzję tylko jeśli użytkownik jest zalogowany
		if (user.value) {
			myReview.value = await reviewsApi.mine(id);
			if (myReview.value) {
				form.rating = myReview.value.rating;
				form.content = myReview.value.content;
			}
		}
	} catch {
		toast.error("Nie znaleziono filmu");
	} finally {
		loading.value = false;
	}
}

onMounted(loadAll);

async function handleDelete() {
	if (!confirm("Na pewno usunąć ten film?")) return;
	await moviesApi.remove(id);
	toast.success("Usunięto");
	router.push("/movies");
}

async function handleAddToWatchlist() {
	try {
		await watchlistApi.add(id);
		toast.success("Dodano do listy do obejrzenia");
	} catch (err: any) {
		toast.error(err.message);
	}
}

async function saveReview() {
	savingReview.value = true;
	try {
		if (myReview.value) {
			await reviewsApi.update(myReview.value.id, {
				rating: form.rating,
				content: form.content,
			});
			toast.success("Recenzja zaktualizowana");
		} else {
			await reviewsApi.create({
				movie_id: id,
				rating: form.rating,
				content: form.content,
			});
			toast.success("Dodano recenzję");
		}
		await loadAll();
	} catch (err: any) {
		toast.error(err.message);
	} finally {
		savingReview.value = false;
	}
}

async function deleteReview() {
	if (!myReview.value) return;
	if (!confirm("Usunąć swoją recenzję?")) return;
	await reviewsApi.remove(myReview.value.id);
	form.rating = 8;
	form.content = "";
	toast.success("Recenzja usunięta");
	await loadAll();
}
</script>

<template>
	<p v-if="loading" class="text-center text-secondary py-5">Ładowanie...</p>
	<p v-else-if="!movie" class="text-center text-secondary py-5">
		Nie znaleziono filmu.
	</p>

	<div v-else style="max-width: 700px">
		<RouterLink to="/movies" class="text-secondary d-inline-block mb-3"
			>← Powrót do listy</RouterLink
		>

		<div class="d-flex gap-4 mb-4">
			<div class="poster-lg d-flex align-items-center justify-content-center">
				{{ movie.media_type === "series" ? "📺" : "🎬" }}
			</div>
			<div>
				<h1 class="h3">{{ movie.title }}</h1>
				<p class="text-secondary mb-1">
					{{ movie.year }} ·
					{{ movie.media_type === "series" ? "Serial" : "Film" }}
					<template v-if="movie.duration_minutes">
						· {{ movie.duration_minutes }} min</template
					>
				</p>
				<p v-if="movie.avg_rating" class="fs-5 fw-bold text-warning mb-0">
					★ {{ movie.avg_rating }} / 10
				</p>
				<p v-else class="text-secondary mb-0">Brak ocen</p>
			</div>
		</div>

		<table class="table table-sm w-auto mb-4">
			<tbody>
				<tr>
					<th class="text-secondary fw-normal pe-4">Reżyser</th>
					<td>{{ movie.director || "—" }}</td>
				</tr>
				<tr>
					<th class="text-secondary fw-normal pe-4">Gatunek</th>
					<td>{{ movie.genre || "—" }}</td>
				</tr>
				<tr>
					<th class="text-secondary fw-normal pe-4">Kraj</th>
					<td>{{ movie.country || "—" }}</td>
				</tr>
			</tbody>
		</table>

		<div v-if="movie.description" class="card mb-4">
			<div class="card-body">{{ movie.description }}</div>
		</div>

		<div class="d-flex gap-2 flex-wrap mb-4">
			<!-- Dodanie do watchlisty tylko dla zalogowanych -->
			<button
				v-if="user"
				@click="handleAddToWatchlist"
				class="btn btn-outline-secondary"
			>
				+ Do obejrzenia
			</button>
			<!-- Edycja i usuwanie tylko dla admina -->
			<template v-if="user?.role === 'admin'">
				<RouterLink
					:to="`/movies/${movie.id}/edit`"
					class="btn btn-outline-secondary"
					>Edytuj</RouterLink
				>
				<button @click="handleDelete" class="btn btn-outline-danger">
					Usuń
				</button>
			</template>
		</div>

		<!-- ── Recenzje ── -->
		<h2 class="h4 mb-3">Recenzje</h2>

		<!-- Formularz oceny — tylko dla zalogowanych -->
		<div v-if="user" class="card mb-4">
			<div class="card-body">
				<h3 class="h6 mb-3">
					{{ myReview ? "Twoja recenzja" : "Oceń ten film" }}
				</h3>
				<div class="mb-3" style="max-width: 140px">
					<label class="form-label">Ocena (1–10)</label>
					<select v-model.number="form.rating" class="form-select">
						<option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
					</select>
				</div>
				<div class="mb-3">
					<label class="form-label">Recenzja (opcjonalnie)</label>
					<textarea
						v-model="form.content"
						class="form-control"
						rows="3"
						placeholder="Co o nim sądzisz?"
					></textarea>
				</div>
				<div class="d-flex gap-2">
					<button
						@click="saveReview"
						class="btn btn-primary"
						:disabled="savingReview"
					>
						{{
							savingReview
								? "Zapisywanie..."
								: myReview
									? "Zaktualizuj"
									: "Dodaj recenzję"
						}}
					</button>
					<button
						v-if="myReview"
						@click="deleteReview"
						class="btn btn-outline-danger"
					>
						Usuń recenzję
					</button>
				</div>
			</div>
		</div>

		<!-- Zachęta do logowania dla niezalogowanych -->
		<div v-else class="alert alert-secondary mb-4">
			<RouterLink to="/login">Zaloguj się</RouterLink>, żeby dodać ocenę i
			recenzję.
		</div>

		<!-- Lista recenzji — widoczna dla wszystkich -->
		<p v-if="reviews.length === 0" class="text-center text-secondary py-4">
			Brak recenzji. Bądź pierwszy!
		</p>
		<div v-else class="vstack gap-2">
			<div v-for="r in reviews" :key="r.id" class="card">
				<div class="card-body">
					<div class="d-flex align-items-center gap-2 mb-1">
						<strong>{{ r.username }}</strong>
						<span class="badge text-bg-warning">★ {{ r.rating }}/10</span>
					</div>
					<p v-if="r.content" class="mb-0">{{ r.content }}</p>
				</div>
			</div>
		</div>
	</div>
</template>
