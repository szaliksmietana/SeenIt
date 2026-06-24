
const BASE = import.meta.env.VITE_API_URL as string;


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

export interface WatchlistItemRaw {
	id: number;
	movie_id: number;
	watched: boolean;
}

export interface WatchlistItem {
	id: number;
	movie_id: number;
	watched: boolean;
	movie: Movie;
}

export interface ReviewRaw {
	id: number;
	user_id: number;
	movie_id: number;
	rating: number;
	content: string;
}

export interface Review {
	id: number;
	user_id: number;
	movie_id: number;
	rating: number;
	content: string;
	username: string;
	created_at: string;
}


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
		}
		throw new Error(message);
	}

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


export const authApi = {
	async register(data: {
		username: string;
		email: string;
		password: string;
		full_name?: string;
	}) {
		return post<User>("/auth/register", data);
	},

	async login(username: string, password: string) {
		const form = new URLSearchParams();
		form.append("username", username);
		form.append("password", password);

		const res = await fetch(`${BASE}/auth/login`, {
			method: "POST",
			body: form,
		});

		if (!res.ok) {
			let message = `Błąd ${res.status}`;
			try {
				const err = await res.json();
				message = parseError(err);
			} catch {
			}
			throw new Error(message);
		}

		const data = (await res.json()) as {
			access_token: string;
			token_type: string;
		};
		localStorage.setItem("token", data.access_token);

		const user = await get<User>("/auth/me");
		localStorage.setItem("current_user", JSON.stringify(user));
		return data;
	},

	async me(): Promise<User> {
		const user = await get<User>("/auth/me");
		localStorage.setItem("current_user", JSON.stringify(user));
		return user;
	},

	async updateProfile(data: {
		full_name?: string;
		email?: string;
	}): Promise<User> {
		const user = await put<User>("/auth/me", data);
		localStorage.setItem("current_user", JSON.stringify(user));
		return user;
	},

	async changePassword(data: {
		current_password: string;
		new_password: string;
	}): Promise<void> {
		await put<User>("/auth/me", { password: data.new_password });
	},

	logout() {
		localStorage.removeItem("token");
		localStorage.removeItem("current_user");
	},
};


export const moviesApi = {
	async list(
		filters: { search?: string; media_type?: "movie" | "series" | "" } = {},
	): Promise<Movie[]> {
		const qs = new URLSearchParams();
		if (filters.search) qs.set("search", filters.search);
		if (filters.media_type) qs.set("media_type", filters.media_type);
		const query = qs.toString() ? `?${qs.toString()}` : "";
		return get<Movie[]>(`/movies${query}`);
	},

	async get(id: number): Promise<Movie> {
		return get<Movie>(`/movies/${id}`);
	},

	async create(data: Omit<Movie, "id" | "avg_rating">): Promise<Movie> {
		return post<Movie>("/movies", data);
	},

	async update(id: number, data: Partial<Movie>): Promise<Movie> {
		return put<Movie>(`/movies/${id}`, data);
	},

	async remove(id: number): Promise<void> {
		return del<void>(`/movies/${id}`);
	},
};


export const watchlistApi = {
	async list(): Promise<WatchlistItem[]> {
		const items = await get<WatchlistItemRaw[]>("/watchlist");

		const withMovies = await Promise.all(
			items.map(async (item) => {
				try {
					const movie = await moviesApi.get(item.movie_id);
					return { ...item, movie };
				} catch {
					return null;
				}
			}),
		);

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


function enrichReview(r: ReviewRaw): Review {
	const raw = localStorage.getItem("current_user");
	const currentUser: User | null = raw ? JSON.parse(raw) : null;
	const username =
		currentUser && currentUser.id === r.user_id
			? currentUser.username
			: `Użytkownik #${r.user_id}`;

	return {
		...r,
		username,
		created_at: new Date().toISOString(),
	};
}

export const reviewsApi = {
	async listForMovie(movieId: number): Promise<Review[]> {
		const reviews = await get<ReviewRaw[]>(`/reviews?movie_id=${movieId}`);
		return reviews.map(enrichReview);
	},

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
		const review = await put<ReviewRaw>(`/reviews/${id}`, data);
		return enrichReview(review);
	},

	async remove(id: number): Promise<void> {
		return del<void>(`/reviews/${id}`);
	},
};


export const adminApi = {
	async allUsers(): Promise<User[]> {
		return get<User[]>("/admin/users");
	},

	async removeUser(id: number): Promise<void> {
		return del<void>(`/admin/users/${id}`);
	},
};
