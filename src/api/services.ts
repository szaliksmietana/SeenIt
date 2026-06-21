// ─────────────────────────────────────────────────────────────────────────────
// MOCK API — udaje backend, trzyma dane w localStorage przeglądarki.
// Każda funkcja zwraca Promise (jak prawdziwe zapytanie sieciowe).
// Gdy powstanie backend, podmienisz ten plik na wywołania fetch/axios.
// Ten plik jest niezależny od frameworka — wygląda tak samo w React i Vue.
// ─────────────────────────────────────────────────────────────────────────────

// Użytkownik. Pole "role" decyduje, czy ma dostęp do panelu CMS.
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
}

export interface Movie {
  id: number;
  title: string;
  year: number;
  director: string | null;
  genre: string | null;
  description: string | null;
  media_type: 'movie' | 'series';
  duration_minutes: number | null;
  country: string | null;
  avg_rating: number | null;
}

export interface WatchlistItem {
  id: number;
  movie_id: number;
  watched: boolean;
  movie: Movie;
}

// Sztuczne opóźnienie, żeby działało jak prawdziwa sieć.
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

// Odczyt i zapis do localStorage (nasza "baza danych").
function load<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}
function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Dane startowe — tworzone tylko przy pierwszym uruchomieniu.
function seed() {
  if (!localStorage.getItem('mock_movies')) {
    save<Movie[]>('mock_movies', [
      { id: 1, title: 'Incepcja', year: 2010, director: 'Christopher Nolan',
        genre: 'Sci-Fi', media_type: 'movie', duration_minutes: 148,
        country: 'USA', avg_rating: 8.8,
        description: 'Złodziej kradnący sekrety z podświadomości dostaje szansę na odkupienie.' },
      { id: 2, title: 'Breaking Bad', year: 2008, director: 'Vince Gilligan',
        genre: 'Dramat', media_type: 'series', duration_minutes: null,
        country: 'USA', avg_rating: 9.5,
        description: 'Nauczyciel chemii zostaje producentem narkotyków.' },
      { id: 3, title: 'Parasite', year: 2019, director: 'Bong Joon-ho',
        genre: 'Thriller', media_type: 'movie', duration_minutes: 132,
        country: 'Korea Płd.', avg_rating: 8.5,
        description: 'Uboga rodzina infiltruje zamożny dom.' },
    ]);
  }
  if (!localStorage.getItem('mock_users')) {
    save<(User & { password: string })[]>('mock_users', [
      // Konto admin jest administratorem — ma dostęp do panelu CMS.
      { id: 1, username: 'admin', email: 'admin@seenit.pl',
        full_name: 'Administrator', role: 'admin', password: 'Admin1234' },
      // Zwykły użytkownik bez dostępu do CMS.
      { id: 2, username: 'demo', email: 'demo@seenit.pl',
        full_name: 'Konto Demo', role: 'user', password: 'Demo1234' },
    ]);
  }
  if (!localStorage.getItem('mock_watchlist')) {
    save<WatchlistItem[]>('mock_watchlist', []);
  }
}
seed();

// Nadaje nowe ID (największe istniejące + 1).
function nextId<T extends { id: number }>(items: T[]): number {
  return items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
}

// ── Logowanie / rejestracja / profil ─────────────────────────────────────────

export const authApi = {
  async register(data: { username: string; email: string; password: string; full_name?: string }) {
    await delay();
    const users = load<(User & { password: string })[]>('mock_users', []);
    if (users.some((u) => u.username === data.username))
      throw new Error('Nazwa użytkownika jest już zajęta');
    if (users.some((u) => u.email === data.email))
      throw new Error('Email jest już zajęty');
    // Nowe konta zawsze dostają rolę "user".
    const user = { id: nextId(users), ...data, full_name: data.full_name ?? null, role: 'user' as const };
    users.push(user);
    save('mock_users', users);
    return user;
  },

  async login(username: string, password: string) {
    await delay();
    const users = load<(User & { password: string })[]>('mock_users', []);
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) throw new Error('Nieprawidłowa nazwa użytkownika lub hasło');
    const token = `mock-token-${user.id}-${Date.now()}`;
    localStorage.setItem('token', token);
    // Zapisujemy zalogowanego użytkownika (bez hasła) razem z jego rolą.
    localStorage.setItem('current_user', JSON.stringify({
      id: user.id, username: user.username, email: user.email,
      full_name: user.full_name, role: user.role,
    }));
    return { access_token: token };
  },

  async me(): Promise<User> {
    await delay(100);
    const raw = localStorage.getItem('current_user');
    if (!raw) throw new Error('Brak zalogowanego użytkownika');
    return JSON.parse(raw);
  },

  async updateProfile(data: { full_name?: string; email?: string }): Promise<User> {
    await delay();
    const current = JSON.parse(localStorage.getItem('current_user')!);
    const updated = { ...current, ...data };
    localStorage.setItem('current_user', JSON.stringify(updated));
    const users = load<(User & { password: string })[]>('mock_users', []);
    const idx = users.findIndex((u) => u.id === current.id);
    if (idx >= 0) { users[idx] = { ...users[idx], ...data }; save('mock_users', users); }
    return updated;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('current_user');
  },
};

// ── Filmy ─────────────────────────────────────────────────────────────────────

export const moviesApi = {
  async list(filters: { search?: string; media_type?: string } = {}): Promise<Movie[]> {
    await delay();
    let movies = load<Movie[]>('mock_movies', []);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      movies = movies.filter((m) => m.title.toLowerCase().includes(q));
    }
    if (filters.media_type) {
      movies = movies.filter((m) => m.media_type === filters.media_type);
    }
    return movies;
  },

  async get(id: number): Promise<Movie> {
    await delay();
    const movie = load<Movie[]>('mock_movies', []).find((m) => m.id === id);
    if (!movie) throw new Error('Film nie został znaleziony');
    return movie;
  },

  async create(data: Omit<Movie, 'id' | 'avg_rating'>): Promise<Movie> {
    await delay();
    const movies = load<Movie[]>('mock_movies', []);
    const movie: Movie = { id: nextId(movies), avg_rating: null, ...data };
    movies.push(movie);
    save('mock_movies', movies);
    return movie;
  },

  async update(id: number, data: Partial<Movie>): Promise<Movie> {
    await delay();
    const movies = load<Movie[]>('mock_movies', []);
    const idx = movies.findIndex((m) => m.id === id);
    if (idx < 0) throw new Error('Film nie istnieje');
    movies[idx] = { ...movies[idx], ...data };
    save('mock_movies', movies);
    return movies[idx];
  },

  async remove(id: number): Promise<void> {
    await delay();
    save('mock_movies', load<Movie[]>('mock_movies', []).filter((m) => m.id !== id));
  },
};

// ── Lista do obejrzenia ───────────────────────────────────────────────────────

export const watchlistApi = {
  async list(): Promise<WatchlistItem[]> {
    await delay();
    return load<WatchlistItem[]>('mock_watchlist', []);
  },

  async add(movie_id: number): Promise<WatchlistItem> {
    await delay();
    const list = load<WatchlistItem[]>('mock_watchlist', []);
    if (list.some((i) => i.movie_id === movie_id))
      throw new Error('Film już jest na liście');
    const movie = await moviesApi.get(movie_id);
    const item: WatchlistItem = { id: nextId(list), movie_id, watched: false, movie };
    list.push(item);
    save('mock_watchlist', list);
    return item;
  },

  async toggleWatched(id: number): Promise<void> {
    await delay();
    const list = load<WatchlistItem[]>('mock_watchlist', []);
    const item = list.find((i) => i.id === id);
    if (item) { item.watched = !item.watched; save('mock_watchlist', list); }
  },

  async remove(id: number): Promise<void> {
    await delay();
    save('mock_watchlist', load<WatchlistItem[]>('mock_watchlist', []).filter((i) => i.id !== id));
  },
};

// ── CMS / panel administratora ──────────────────────────────────────────────
// Proste funkcje używane tylko w panelu /admin. Dają podgląd i usuwanie treści.

export const adminApi = {
  // Wszyscy użytkownicy (bez haseł — nie pokazujemy ich w panelu).
  async allUsers(): Promise<User[]> {
    await delay();
    const users = load<(User & { password: string })[]>('mock_users', []);
    return users.map(({ password, ...rest }) => rest);
  },

  // Usunięcie użytkownika po ID.
  async removeUser(id: number): Promise<void> {
    await delay();
    const users = load<(User & { password: string })[]>('mock_users', []);
    save('mock_users', users.filter((u) => u.id !== id));
  },
};
