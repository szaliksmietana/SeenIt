<script setup lang="ts">
import { ref, reactive } from "vue";
import { toast } from "vue3-toastify";
import { authApi } from "../api/services";
import { useAuth } from "../stores/auth";

const { user, refreshUser } = useAuth();

// ── Formularz danych profilu ──────────────────────────────────────────────────

const profileForm = reactive({
	full_name: user.value?.full_name || "",
	email: user.value?.email || "",
});
const profileErrors = reactive({ email: "" });
const savingProfile = ref(false);

function validateProfile(): boolean {
	if (!profileForm.email) profileErrors.email = "Email jest wymagany";
	else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email))
		profileErrors.email = "Nieprawidłowy email";
	else profileErrors.email = "";
	return !profileErrors.email;
}

async function saveProfile() {
	if (!validateProfile()) return;
	savingProfile.value = true;
	try {
		await authApi.updateProfile({
			full_name: profileForm.full_name,
			email: profileForm.email,
		});
		await refreshUser();
		toast.success("Profil zaktualizowany");
	} catch (err: any) {
		toast.error(err.message);
	} finally {
		savingProfile.value = false;
	}
}

// ── Formularz zmiany hasła ────────────────────────────────────────────────────

const passwordForm = reactive({
	current_password: "",
	new_password: "",
	confirm_password: "",
});
const passwordErrors = reactive({
	current_password: "",
	new_password: "",
	confirm_password: "",
});
const savingPassword = ref(false);

function validatePassword(): boolean {
	// Stare hasło — wymagane
	passwordErrors.current_password = passwordForm.current_password
		? ""
		: "Podaj aktualne hasło";

	// Nowe hasło — min. 8 znaków, cyfra, wielka litera
	if (!passwordForm.new_password)
		passwordErrors.new_password = "Podaj nowe hasło";
	else if (passwordForm.new_password.length < 8)
		passwordErrors.new_password = "Minimum 8 znaków";
	else if (!/\d/.test(passwordForm.new_password))
		passwordErrors.new_password = "Hasło musi zawierać cyfrę";
	else if (!/[A-Z]/.test(passwordForm.new_password))
		passwordErrors.new_password = "Hasło musi zawierać wielką literę";
	else passwordErrors.new_password = "";

	// Potwierdzenie — musi być identyczne
	passwordErrors.confirm_password =
		passwordForm.confirm_password === passwordForm.new_password
			? ""
			: "Hasła nie są identyczne";

	return (
		!passwordErrors.current_password &&
		!passwordErrors.new_password &&
		!passwordErrors.confirm_password
	);
}

async function changePassword() {
	if (!validatePassword()) return;
	savingPassword.value = true;
	try {
		await authApi.changePassword({
			current_password: passwordForm.current_password,
			new_password: passwordForm.new_password,
		});
		toast.success("Hasło zostało zmienione");
		// Czyścimy formularz po sukcesie
		passwordForm.current_password = "";
		passwordForm.new_password = "";
		passwordForm.confirm_password = "";
	} catch (err: any) {
		toast.error(err.message);
	} finally {
		savingPassword.value = false;
	}
}
</script>

<template>
	<div class="mx-auto" style="max-width: 480px">
		<!-- Dane profilu -->
		<div class="card mb-4">
			<div class="card-body">
				<h1 class="h5 mb-1">Profil</h1>
				<p class="text-secondary small mb-3">
					Zalogowany jako <strong>{{ user?.username }}</strong>
				</p>

				<form @submit.prevent="saveProfile" novalidate>
					<div class="mb-3">
						<label class="form-label">Imię i nazwisko</label>
						<input v-model="profileForm.full_name" class="form-control" />
					</div>
					<div class="mb-3">
						<label class="form-label">Email</label>
						<input
							v-model="profileForm.email"
							type="email"
							class="form-control"
							:class="{ 'is-invalid': profileErrors.email }"
						/>
						<div class="invalid-feedback">{{ profileErrors.email }}</div>
					</div>
					<button
						type="submit"
						class="btn btn-primary"
						:disabled="savingProfile"
					>
						{{ savingProfile ? "Zapisywanie..." : "Zapisz zmiany" }}
					</button>
				</form>
			</div>
		</div>

		<!-- Zmiana hasła -->
		<div class="card">
			<div class="card-body">
				<div class="d-flex justify-content-between align-items-center mb-3">
					<h2 class="h5 mb-0">Zmiana hasła</h2>
					<RouterLink to="/forgot-password" class="text-secondary small"
						>Zapomniałem hasła</RouterLink
					>
				</div>

				<form @submit.prevent="changePassword" novalidate>
					<div class="mb-3">
						<label class="form-label">Aktualne hasło</label>
						<input
							v-model="passwordForm.current_password"
							type="password"
							class="form-control"
							:class="{ 'is-invalid': passwordErrors.current_password }"
							autocomplete="current-password"
						/>
						<div class="invalid-feedback">
							{{ passwordErrors.current_password }}
						</div>
					</div>

					<div class="mb-3">
						<label class="form-label">Nowe hasło</label>
						<input
							v-model="passwordForm.new_password"
							type="password"
							class="form-control"
							:class="{ 'is-invalid': passwordErrors.new_password }"
							autocomplete="new-password"
						/>
						<div class="invalid-feedback">
							{{ passwordErrors.new_password }}
						</div>
						<div class="form-text">
							Min. 8 znaków, jedna cyfra, jedna wielka litera.
						</div>
					</div>

					<div class="mb-3">
						<label class="form-label">Powtórz nowe hasło</label>
						<input
							v-model="passwordForm.confirm_password"
							type="password"
							class="form-control"
							:class="{ 'is-invalid': passwordErrors.confirm_password }"
							autocomplete="new-password"
						/>
						<div class="invalid-feedback">
							{{ passwordErrors.confirm_password }}
						</div>
					</div>

					<button
						type="submit"
						class="btn btn-outline-primary"
						:disabled="savingPassword"
					>
						{{ savingPassword ? "Zmienianie..." : "Zmień hasło" }}
					</button>
				</form>
			</div>
		</div>
	</div>
</template>
