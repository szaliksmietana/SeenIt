<script setup lang="ts">
import { useAuth } from "../stores/auth";

const { user, logout } = useAuth();
</script>

<template>
	<nav class="navbar navbar-expand bg-body-tertiary border-bottom">
		<div class="container">
			<!-- Logo — przenosi na stronę główną -->
			<RouterLink to="/" class="navbar-brand">
				<img src="../public/seenit.png" alt="SeenIt" height="36" />
			</RouterLink>

			<ul class="navbar-nav ms-auto align-items-center gap-2">
				<!-- Widoczne dla wszystkich -->
				<li class="nav-item">
					<RouterLink to="/movies" class="nav-link">Filmy</RouterLink>
				</li>

				<!-- Tylko zalogowany -->
				<template v-if="user">
					<li class="nav-item">
						<RouterLink to="/watchlist" class="nav-link"
							>Do obejrzenia</RouterLink
						>
					</li>
					<li class="nav-item">
						<RouterLink to="/profile" class="nav-link">Profil</RouterLink>
					</li>
					<!-- Tylko admin -->
					<li v-if="user.role === 'admin'" class="nav-item">
						<RouterLink to="/movies/add" class="nav-link"
							>Dodaj film</RouterLink
						>
					</li>
					<li v-if="user.role === 'admin'" class="nav-item">
						<RouterLink to="/admin" class="nav-link">Panel CMS</RouterLink>
					</li>
					<li class="nav-item">
						<span class="navbar-text fw-semibold">{{ user.username }}</span>
					</li>
					<li class="nav-item">
						<button @click="logout" class="btn btn-sm btn-outline-secondary">
							Wyloguj
						</button>
					</li>
				</template>

				<!-- Niezalogowany -->
				<template v-else>
					<li class="nav-item">
						<RouterLink to="/login" class="nav-link">Zaloguj się</RouterLink>
					</li>
					<li class="nav-item">
						<RouterLink to="/register" class="btn btn-sm btn-primary"
							>Zarejestruj się</RouterLink
						>
					</li>
				</template>
			</ul>
		</div>
	</nav>
</template>
