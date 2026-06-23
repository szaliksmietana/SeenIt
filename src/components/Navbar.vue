<script setup lang="ts">
import { useAuth } from "../stores/auth";

const { user, logout } = useAuth();

function handleLogout() {
	localStorage.removeItem("token");
	localStorage.removeItem("current_user");
	window.location.href = "/";
}
</script>

<template>
	<nav class="navbar navbar-expand bg-body-tertiary border-bottom">
		<div class="container">
			<RouterLink to="/" class="navbar-brand py-1">
				<img
					src="../public/seenit.png"
					alt="SeenIt"
					height="32"
					style="display: block"
				/>
			</RouterLink>

			<div class="d-flex align-items-center gap-3 ms-auto flex-nowrap">
				<RouterLink
					to="/movies"
					class="nav-link"
					active-class="fw-bold text-body"
				>
					Filmy
				</RouterLink>

				<template v-if="user">
					<RouterLink
						to="/watchlist"
						class="nav-link"
						active-class="fw-bold text-body"
					>
						Do obejrzenia
					</RouterLink>
					<RouterLink
						to="/profile"
						class="nav-link"
						active-class="fw-bold text-body"
					>
						Profil
					</RouterLink>
					<RouterLink
						v-if="user.role === 'admin'"
						to="/movies/add"
						class="nav-link"
						active-class="fw-bold text-body"
					>
						Dodaj film
					</RouterLink>
					<RouterLink
						v-if="user.role === 'admin'"
						to="/admin"
						class="nav-link"
						active-class="fw-bold text-body"
					>
						Panel CMS
					</RouterLink>
					<span class="text-body fw-semibold">{{ user.username }}</span>
					<a
						href="#"
						class="btn btn-sm btn-outline-secondary"
						@click.prevent="handleLogout"
					>
						Wyloguj
					</a>
				</template>

				<template v-else>
					<RouterLink
						to="/login"
						class="nav-link"
						active-class="fw-bold text-body"
					>
						Zaloguj się
					</RouterLink>
					<RouterLink to="/register" class="btn btn-sm btn-primary">
						Zarejestruj się
					</RouterLink>
				</template>
			</div>
		</div>
	</nav>
</template>
