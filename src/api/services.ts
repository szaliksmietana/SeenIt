// ─────────────────────────────────────────────────────────────────────────────
// API — łączy się z backendem przez fetch.
// Adres backendu pochodzi z pliku .env (zmienna VITE_API_URL).
// ─────────────────────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL as string;

// ── Typy danych ───────────────────────────────────────────────────────────────

export interface User {
	id: number;
	username: string;
	email: string;
	full_name: string | null;
	role: "admin" | "user";
}

export interface Movie {
	id: number;
	title: string;
	year: number;
	director: string | null;
	genre: string | null;
	description: string | null;
	media_type: "movie" | "series";
	duration_minutes: number | null;
	country: string | null;
	avg_rating: number | null;
}

// Watchlist z backendu — bez zagnieżdżonego movie
export interface WatchlistItemRaw {
	id: number;
	movie_id: number;
	watched: boolean;
}

// Watchlist używany w UI — z dołączonym filmem (dociągamy osobno)
export interface WatchlistItem {
	id: number;
	movie_id: number;
	watched: boolean;
	movie: Movie;
}

// Review z backendu — brak pola username
export interface ReviewRaw {
	id: number;
	user_id: number;
	movie_id: number;
	rating: number;
	content: string;
}

// Review używany w UI — z username (dociągamy z current_user gdy to nasza recenzja)
export interface Review {
	id: number;
	user_id: number;
	movie_id: number;
	rating: number;
	content: string;
	username: string;
	created_at: string;
}

// ── Pomocnicze funkcje fetch ──────────────────────────────────────────────────

function getToken(): string | null {
	return localStorage.getItem("token");
}

function authHeaders(): HeadersInit {
	const h: Record<string, string> = {
		"Content-Type": "application/json",
	};
	const token = getToken();
	if (token) h["Authorization"] = `Bearer ${token}`;
	return h;
}

// Parsuje błąd z backendu — obsługuje string i tablicę Pydantic
function parseError(err: any): string {
	if (typeof err.detail === "string") return err.detail;
	if (Array.isArray(err.detail))
		return err.detail.map((e: any) => e.msg).join(", ");
	if (err.message) return err.message;
	return "Nieznany błąd";
}

async function request<T>(
	method: string,
	path: string,
	body?: unknown,
): Promise<T> {
	const res = await fetch(`${BASE}${path}`, {
		method,
		headers: authHeaders(),
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});

	if (!res.ok) {
		let message = `Błąd ${res.status}`;
		try {
			const err = await res.json();
			message = parseError(err);
		} catch {
			/* ignoruj */
		}
		throw new Error(message);
	}

	// Backend może zwrócić 204 (brak body) albo body z tekstem przy DELETE —
	// w obu przypadkach traktujemy to jako sukces i ignorujemy body.
	if (res.status === 204) return undefined as T;

	const contentType = res.headers.get("content-type") ?? "";
	if (!contentType.includes("application/json")) return undefined as T;

	return res.json();
}

const get = <T>(path: string) => request<T>("GET", path);
const post = <T>(path: string, body: unknown) => request<T>("POST", path, body);
const put = <T>(path: string, body: unknown) => request<T>("PUT", path, body);
const patch = <T>(path: string, body?: unknown) =>
	request<T>("PATCH", path, body);
const del = <T>(path: string) => request<T>("DELETE", path);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
	async register(data: {
		username: string;
		email: string;
		password: string;
		full_name?: string;
	}) {
		return post<User>("/auth/register", data);
	},

	// Logowanie — FastAPI używa OAuth2PasswordRequestForm (form data, nie JSON)
	async login(username: string, password: string) {
		const form = new URLSearchParams();
		form.append("username", username);
		form.append("password", password);

		const res = await fetch(`${BASE}/auth/login`, {
			method: "POST",
			body: form,
			// Nie ustawiamy Content-Type — URLSearchParams ustawi go automatycznie
		});

		if (!res.ok) {
			let message = `Błąd ${res.status}`;
			try {
				const err = await res.json();
				message = parseError(err);
			} catch {
				/* ignoruj */
			}
			throw new Error(message);
		}

		const data = (await res.json()) as {
			access_token: string;
			token_type: string;
		};
		localStorage.setItem("token", data.access_token);

		// Dociągamy dane użytkownika i zapisujemy w localStorage
		const user = await get<User>("/auth/me");
		localStorage.setItem("current_user", JSON.stringify(user));
		return data;
	},

	async me(): Promise<User> {
		const user = await get<User>("/auth/me");
		localStorage.setItem("current_user", JSON.stringify(user));
		return user;
	},

	// Edycja profilu — endpoint może jeszcze nie istnieć
	async updateProfile(data: {
		full_name?: string;
		email?: string;
	}): Promise<User> {
		try {
			const user = await put<User>("/auth/me", data);
			localStorage.setItem("current_user", JSON.stringify(user));
			return user;
		} catch (err: any) {
			// Fallback gdy endpoint jeszcze nie istnieje — aktualizuj tylko lokalnie
			if (err.message.includes("404") || err.message.includes("405")) {
				const current = JSON.parse(localStorage.getItem("current_user")!);
				const updated = { ...current, ...data };
				localStorage.setItem("current_user", JSON.stringify(updated));
				return updated;
			}
			throw err;
		}
	},

	logout() {
		localStorage.removeItem("token");
		localStorage.removeItem("current_user");
	},
};

// ── Filmy ─────────────────────────────────────────────────────────────────────

export const moviesApi = {
	async list(
		filters: { search?: string; media_type?: string } = {},
	): Promise<Movie[]> {
		const params = new URLSearchParams();
		if (filters.search) params.set("search", filters.search);
		if (filters.media_type) params.set("media_type", filters.media_type);
		const qs = params.toString() ? `?${params}` : "";
		return get<Movie[]>(`/movies${qs}`);
	},

	async get(id: number): Promise<Movie> {
		return get<Movie>(`/movies/${id}`);
	},

	async create(data: Omit<Movie, "id" | "avg_rating">): Promise<Movie> {
		return post<Movie>("/movies", data);
	},

	async update(id: number, data: Partial<Movie>): Promise<Movie> {
		try {
			return await put<Movie>(`/movies/${id}`, data);
		} catch (err: any) {
			if (err.message.includes("404") || err.message.includes("405")) {
				throw new Error("Edycja filmów nie jest jeszcze dostępna na serwerze");
			}
			throw err;
		}
	},

	async remove(id: number): Promise<void> {
		return del<void>(`/movies/${id}`);
	},
};

// ── Watchlista ────────────────────────────────────────────────────────────────
// Backend zwraca tylko { id, movie_id, watched } — bez danych filmu.
// Dociągamy każdy film osobno i sklejamy w WatchlistItem.

export const watchlistApi = {
	async list(): Promise<WatchlistItem[]> {
		const items = await get<WatchlistItemRaw[]>("/watchlist");

		// Dociągamy dane każdego filmu — Promise.all robi to równolegle
		const withMovies = await Promise.all(
			items.map(async (item) => {
				try {
					const movie = await moviesApi.get(item.movie_id);
					return { ...item, movie };
				} catch {
					// Jeśli film nie istnieje (np. usunięty) — pomijamy pozycję
					return null;
				}
			}),
		);

		// Filtrujemy null (filmy których nie udało się pobrać)
		return withMovies.filter((i): i is WatchlistItem => i !== null);
	},

	async add(movie_id: number): Promise<WatchlistItemRaw> {
		return post<WatchlistItemRaw>("/watchlist", { movie_id });
	},

	async toggleWatched(id: number): Promise<void> {
		return patch<void>(`/watchlist/${id}`);
	},

	async remove(id: number): Promise<void> {
		return del<void>(`/watchlist/${id}`);
	},
};

// ── Recenzje ──────────────────────────────────────────────────────────────────
// Backend: GET /reviews?movie_id=X — filtruje po movie_id (query param)
// Brak pola username — dociągamy je z localStorage dla własnych recenzji,
// dla cudzych używamy "Użytkownik #ID"

function enrichReview(r: ReviewRaw): Review {
	// Sprawdzamy czy to recenzja zalogowanego użytkownika
	const raw = localStorage.getItem("current_user");
	const currentUser: User | null = raw ? JSON.parse(raw) : null;
	const username =
		currentUser && currentUser.id === r.user_id
			? currentUser.username
			: `Użytkownik #${r.user_id}`;

	return {
		...r,
		username,
		created_at: new Date().toISOString(), // backend nie zwraca created_at
	};
}

export const reviewsApi = {
	// Recenzje danego filmu — backend już filtruje po movie_id
	async listForMovie(movieId: number): Promise<Review[]> {
		const reviews = await get<ReviewRaw[]>(`/reviews?movie_id=${movieId}`);
		return reviews.map(enrichReview);
	},

	// Recenzja zalogowanego użytkownika dla danego filmu (null jeśli brak)
	async mine(movieId: number): Promise<Review | null> {
		const raw = localStorage.getItem("current_user");
		if (!raw) return null;
		const currentUser: User = JSON.parse(raw);

		const reviews = await get<ReviewRaw[]>(`/reviews?movie_id=${movieId}`);
		const mine = reviews.find((r) => r.user_id === currentUser.id);
		return mine ? enrichReview(mine) : null;
	},

	async create(data: {
		movie_id: number;
		rating: number;
		content: string;
	}): Promise<Review> {
		const review = await post<ReviewRaw>("/reviews", data);
		return enrichReview(review);
	},

	async update(
		id: number,
		data: { rating: number; content: string },
	): Promise<Review> {
		try {
			const review = await put<ReviewRaw>(`/reviews/${id}`, data);
			return enrichReview(review);
		} catch (err: any) {
			if (err.message.includes("404") || err.message.includes("405")) {
				throw new Error(
					"Edycja recenzji nie jest jeszcze dostępna na serwerze",
				);
			}
			throw err;
		}
	},

	async remove(id: number): Promise<void> {
		try {
			return await del<void>(`/reviews/${id}`);
		} catch (err: any) {
			if (err.message.includes("404") || err.message.includes("405")) {
				throw new Error(
					"Usuwanie recenzji nie jest jeszcze dostępne na serwerze",
				);
			}
			throw err;
		}
	},
};

// ── Panel CMS (admin) ─────────────────────────────────────────────────────────

export const adminApi = {
	async allUsers(): Promise<User[]> {
		try {
			return await get<User[]>("/admin/users");
		} catch (err: any) {
			if (err.message.includes("404") || err.message.includes("405")) {
				console.warn("Endpoint /admin/users jeszcze nie istnieje");
				return [];
			}
			throw err;
		}
	},

	async removeUser(id: number): Promise<void> {
		try {
			return await del<void>(`/admin/users/${id}`);
		} catch (err: any) {
			if (err.message.includes("404") || err.message.includes("405")) {
				throw new Error(
					"Usuwanie użytkowników nie jest jeszcze dostępne na serwerze",
				);
			}
			throw err;
		}
	},
};
