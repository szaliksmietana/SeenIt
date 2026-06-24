<script setup lang="ts">
import { useAuth } from "../stores/auth";
const { user } = useAuth();
</script>

<template>
	<div class="text-center py-5">
		<img
			src="../public/seenit.png"
			alt="SeenIt"
			class="mb-4"
			style="max-width: 220px; width: 100%"
		/>
		<p class="lead text-secondary mb-4">
			Twoja osobista baza filmów i seriali.<br />
			Oceniaj, recenzuj i śledź co chcesz zobaczyć.
		</p>

		<RouterLink to="/movies" class="btn btn-primary btn-lg px-5">
			Przeglądaj filmy
		</RouterLink>

		<!-- Dla niezalogowanych -->
		<div v-if="!user" class="mt-3">
			<RouterLink to="/login" class="btn btn-outline-secondary me-2"
				>Zaloguj się</RouterLink
			>
			<RouterLink to="/register" class="btn btn-outline-secondary"
				>Zarejestruj się</RouterLink
			>
		</div>

		<!-- Sekcja features -->
		<div class="row g-4 mt-5 text-start">
			<div class="col-md-4">
				<div class="card h-100">
					<div class="card-body">
						<div class="fs-1 mb-2">🎬</div>
						<h5 class="card-title">Baza filmów</h5>
						<p class="card-text text-secondary">
							Przeglądaj filmy i seriale. Filtruj po typie, szukaj po tytule.
						</p>
					</div>
				</div>
			</div>
			<div class="col-md-4">
				<div class="card h-100">
					<div class="card-body">
						<div class="fs-1 mb-2">⭐</div>
						<h5 class="card-title">Oceny i recenzje</h5>
						<p class="card-text text-secondary">
							Oceń film w skali 1–10 i napisz co o nim sądzisz.
						</p>
					</div>
				</div>
			</div>
			<div class="col-md-4">
				<div class="card h-100">
					<div class="card-body">
						<div class="fs-1 mb-2">📋</div>
						<h5 class="card-title">Lista do obejrzenia</h5>
						<p class="card-text text-secondary">
							Zapisuj filmy które chcesz zobaczyć i oznaczaj obejrzane.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
