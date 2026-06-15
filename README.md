# CineVault — frontend

Baza filmów i seriali. SPA napisane w React + TypeScript + Vite.

Na tym etapie aplikacja działa **samodzielnie** — nie potrzebuje backendu.
Dane (użytkownicy, filmy, watchlista) trzymane są w `localStorage` przeglądarki
przez warstwę mock w `src/api/services.ts`. Gdy powstanie backend, podmienisz
tylko ten jeden plik na prawdziwe wywołania `fetch`/`axios`.

## Wymagania

- Node.js 18+ (sprawdź: `node --version`)
- npm (instaluje się razem z Node)

## Uruchomienie

```bash
cd frontend
npm install        # instalacja zależności (raz)
npm run dev        # serwer deweloperski → http://localhost:5173
```

Otwórz http://localhost:5173 w przeglądarce.

### Konto demo

Aplikacja tworzy gotowe konto przy pierwszym uruchomieniu:

- login: `demo`
- hasło: `Demo1234`

Możesz też założyć własne przez stronę rejestracji.

## Pozostałe komendy

```bash
npm run build      # build produkcyjny do folderu dist/
npm run preview    # podgląd buildu produkcyjnego
```

## Struktura projektu

```
frontend/
├── index.html              punkt wejścia HTML
├── vite.config.ts          konfiguracja Vite
├── tsconfig.json           konfiguracja TypeScript
├── package.json            zależności i skrypty
└── src/
    ├── main.tsx            bootstrap Reacta (router, auth, toasty)
    ├── App.tsx             definicje tras (routing)
    ├── index.css           style globalne (czysty CSS, bez frameworka)
    ├── api/
    │   └── services.ts     MOCK API — tu podmienisz na prawdziwy backend
    ├── context/
    │   └── AuthContext.tsx globalny stan logowania
    ├── components/
    │   ├── Navbar.tsx      górne menu
    │   └── PrivateRoute.tsx ochrona tras (wymaga logowania)
    └── pages/
        ├── Login.tsx       logowanie (formularz z walidacją)
        ├── Register.tsx    rejestracja (formularz z walidacją)
        ├── MovieList.tsx   lista filmów + wyszukiwanie/filtr
        ├── MovieDetails.tsx szczegóły filmu
        ├── MovieForm.tsx   dodawanie i edycja (wspólny formularz)
        ├── Watchlist.tsx   lista do obejrzenia
        └── Profile.tsx     profil użytkownika
```

## 7 podstron (wymóg zaliczenia)

1. `/login` — logowanie
2. `/register` — rejestracja
3. `/movies` — lista (z wyszukiwaniem i filtrowaniem)
4. `/movies/:id` — szczegóły
5. `/movies/add` — dodawanie
6. `/movies/:id/edit` — edycja
7. `/watchlist` — lista do obejrzenia
8. `/profile` — profil (bonus, ósma podstrona)

## Formularze z walidacją

- **Rejestracja** — login (min. 3 znaki, dozwolone znaki), email (format),
  hasło (min. 8 znaków, cyfra, wielka litera), powtórzenie hasła (zgodność).
- **Dodawanie/edycja filmu** — tytuł (wymagany, max 200), rok (1888–2100),
  czas trwania (dodatni).

Walidacja po stronie klienta robiona przez `react-hook-form`. Walidacja
serwerowa dojdzie razem z backendem (te same reguły w Pydantic).

## Użyte technologie

- **React 18** — biblioteka UI
- **TypeScript** — typowanie
- **Vite** — bundler i serwer deweloperski
- **React Router v6** — routing SPA
- **react-hook-form** — obsługa i walidacja formularzy
- **react-hot-toast** — powiadomienia
- **czysty CSS** — bez frameworka (dark theme)
