<script setup lang="ts">
import { ref, reactive } from "vue";
import { toast } from "vue3-toastify";

// Formularz resetu hasła.
// Na razie pokazuje komunikat że funkcja jest niedostępna —
// wymaga endpointu po stronie backendu (np. POST /auth/reset-password).
const form = reactive({ email: "" });
const errors = reactive({ email: "" });
const submitted = ref(false);
const submitting = ref(false);

function validate(): boolean {
	if (!form.email) errors.email = "Podaj adres email";
	else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
		errors.email = "Nieprawidłowy email";
	else errors.email = "";
	return !errors.email;
}

async function onSubmit() {
	if (!validate()) return;
	submitting.value = true;
	try {
		// TODO: gdy backend doda endpoint — odkomentuj:
		// await authApi.requestPasswordReset(form.email);
		// Na razie symulujemy sukces
		await new Promise((r) => setTimeout(r, 600));
		submitted.value = true;
	} catch (err: any) {
		toast.error(err.message || "Błąd — spróbuj ponownie");
	} finally {
		submitting.value = false;
	}
}
</script>

<template>
	<div class="card mx-auto" style="max-width: 440px">
		<div class="card-body">
			<h1 class="h4 mb-1">Reset hasła</h1>
			<p class="text-secondary small mb-3">
				Podaj email przypisany do konta — wyślemy link do zmiany hasła.
			</p>

			<!-- Po wysłaniu formularza -->
			<div v-if="submitted" class="alert alert-success">
				Jeśli konto istnieje, wysłaliśmy email z instrukcjami. Sprawdź skrzynkę
				(i folder spam).
			</div>

			<!-- Formularz -->
			<form v-else @submit.prevent="onSubmit" novalidate>
				<div class="mb-3">
					<label class="form-label">Adres email</label>
					<input
						v-model="form.email"
						type="email"
						class="form-control"
						:class="{ 'is-invalid': errors.email }"
						placeholder="jan@example.com"
						autocomplete="email"
					/>
					<div class="invalid-feedback">{{ errors.email }}</div>
				</div>

				<button
					type="submit"
					class="btn btn-primary w-100"
					:disabled="submitting"
				>
					{{ submitting ? "Wysyłanie..." : "Wyślij link resetujący" }}
				</button>
			</form>

			<p class="text-center text-secondary small mt-3 mb-0">
				<RouterLink to="/login">← Wróć do logowania</RouterLink>
			</p>
		</div>
	</div>
</template>
