# SeenIt

Baza filmów i seriali. SPA napisane w **Vue 3 + TypeScript + Vite**.

Na tym etapie aplikacja działa **samodzielnie** — nie potrzebuje backendu.
Dane (użytkownicy, filmy, watchlista) trzymane są w `localStorage` przeglądarki
przez warstwę mock w `src/api/services.ts`. Gdy powstanie backend, podmienisz
tylko ten jeden plik na prawdziwe wywołania `fetch`/`axios`.

## Wymagania

- Node.js 18+ (sprawdź: `node --version`)
- npm (instaluje się razem z Node)

## Uruchomienie

```bash
npm install        # instalacja zależności (raz)
npm run dev        # serwer deweloperski → http://localhost:5173
```

### Konta testowe

- administrator (dostęp do panelu CMS): `admin` / `Admin1234`
- zwykły użytkownik: `demo` / `Demo1234`

## Pozostałe komendy

```bash
npm run build      # build produkcyjny do folderu dist/
npm run preview    # podgląd buildu produkcyjnego
```

## Struktura projektu

```
.
├── index.html              punkt wejścia HTML
├── vite.config.ts          konfiguracja Vite
├── tsconfig.json           konfiguracja TypeScript
├── env.d.ts                typy dla plików .vue
├── package.json            zależności i skrypty
└── src/
    ├── main.ts             bootstrap aplikacji (router, toasty, init)
    ├── App.vue             korzeń aplikacji (navbar + RouterView)
    ├── style.css           style globalne (czysty CSS, dark theme)
    ├── api/
    │   └── services.ts     MOCK API — tu podmienisz na prawdziwy backend
    ├── stores/
    │   └── auth.ts         globalny stan logowania (composable)
    ├── router/
    │   └── index.ts        trasy + strażnik dostępu (logowanie / admin)
    ├── components/
    │   └── Navbar.vue      górne menu
    └── pages/
        ├── Login.vue        logowanie (formularz z walidacją)
        ├── Register.vue     rejestracja (formularz z walidacją)
        ├── MovieList.vue    lista filmów + wyszukiwanie/filtr
        ├── MovieDetails.vue szczegóły filmu
        ├── MovieForm.vue    dodawanie i edycja (wspólny formularz)
        ├── Watchlist.vue    lista do obejrzenia
        ├── Profile.vue      profil użytkownika
        └── Admin.vue        panel CMS (tylko administrator)
```

## Podstrony

1. `/login` — logowanie
2. `/register` — rejestracja
3. `/movies` — lista (z wyszukiwaniem i filtrowaniem)
4. `/movies/:id` — szczegóły
5. `/movies/add` — dodawanie
6. `/movies/:id/edit` — edycja
7. `/watchlist` — lista do obejrzenia
8. `/profile` — profil
9. `/admin` — panel CMS (tylko administrator)

## Panel CMS

Dostępny pod `/admin`, tylko dla użytkownika z rolą `admin`. Link w menu pojawia
się wyłącznie administratorowi, a trasa jest dodatkowo chroniona przez strażnika
w routerze (`router.beforeEach`). Panel pokazuje liczbę filmów i użytkowników
oraz pozwala usuwać filmy i konta użytkowników (poza kontem administratora).

## Użyte technologie

- **Vue 3** — framework UI (składnia `<script setup>`)
- **TypeScript** — typowanie
- **Vite** — bundler i serwer deweloperski
- **Vue Router 4** — routing SPA + strażnik tras
- **vue3-toastify** — powiadomienia
- **czysty CSS** — bez frameworka (dark theme)
