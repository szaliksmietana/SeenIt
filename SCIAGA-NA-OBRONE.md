# Ściąga na obronę — SeenIt (Vue 3)

Krótkie wytłumaczenia prostym językiem. Każdy punkt to coś, o co mogą zapytać.

## Jak zbudowany jest plik `.vue`

Każdy komponent (np. `Login.vue`) ma dwie–trzy sekcje:

- `<script setup lang="ts">` — **logika**: zmienne, funkcje, co się dzieje po kliknięciu.
- `<template>` — **HTML**: jak strona wygląda.
- `<style>` — wygląd CSS (u nas style są wspólne w `style.css`, więc tej sekcji nie ma).

Gdy zapytają „gdzie jest X" — logika jest w `<script>`, wygląd w `<template>`.

## Najważniejsze pojęcia Vue (wystarczy tych pięć)

**`ref(...)`** — tworzy zmienną reaktywną. „Reaktywna" znaczy: gdy zmienisz jej
wartość, widok sam się odświeży. Do wartości w logice sięgasz przez `.value`
(np. `loading.value = false`), ale w `<template>` piszesz samą nazwę.

**`reactive({...})`** — to samo co `ref`, ale dla całego obiektu. Używamy go na
dane formularzy (`form.username`, `form.password`) — wygodniej niż osobny `ref`
na każde pole.

**`v-model`** — dwukierunkowe powiązanie pola z danymi. `<input v-model="form.username">`
oznacza: co użytkownik wpisze, ląduje w `form.username`, i odwrotnie.

**`v-if` / `v-for`** — sterowanie szablonem. `v-if="user"` = pokaż tylko gdy
użytkownik istnieje. `v-for="m in movies"` = wygeneruj element dla każdego filmu.

**`@click` / `@submit.prevent`** — reakcja na zdarzenia. `@click="logout"` =
po kliknięciu wywołaj `logout`. `.prevent` przy formularzu blokuje domyślne
przeładowanie strony.

## Jak działa logowanie (przepływ)

1. Użytkownik wpisuje login/hasło w `Login.vue`, klika „Zaloguj".
2. Wywoływane jest `login()` ze `stores/auth.ts`.
3. To woła `authApi.login()` z `services.ts` — sprawdza dane i zapisuje token
   oraz dane użytkownika w `localStorage`.
4. `refreshUser()` wczytuje użytkownika do wspólnej zmiennej `user`.
5. Router przekierowuje na `/movies`.

## Globalny stan — `stores/auth.ts`

Zmienne `user` i `loading` są zadeklarowane **na górze pliku**, poza funkcjami.
Dlatego są wspólne dla całej aplikacji — każdy komponent, który zaimportuje
`useAuth()`, widzi tego samego użytkownika. To odpowiednik „globalnego pudełka"
z danymi logowania.

## Ochrona stron — `router/index.ts`

Każda chroniona trasa ma etykietę w `meta`, np. `meta: { requiresAuth: true }`.
Funkcja `router.beforeEach` uruchamia się **przed** każdym wejściem na stronę
i sprawdza te etykiety:

- brak zalogowania na stronie wymagającej logowania → przekierowanie na `/login`,
- brak roli admina na `/admin` → przekierowanie na `/movies`.

Ukrycie linku w menu to tylko wygoda — prawdziwe zabezpieczenie to ten strażnik.

## Walidacja formularzy

Robiona ręcznie (bez biblioteki). Każdy formularz ma:

- obiekt `errors` z komunikatem dla każdego pola,
- funkcję `validate()`, która sprawdza warunki i wypełnia `errors`,
- w `<template>`: `<span v-if="errors.pole">{{ errors.pole }}</span>` pokazuje błąd.

Przykłady reguł: hasło min. 8 znaków + cyfra + wielka litera (rejestracja),
rok w zakresie 1888–2100 (formularz filmu). Walidacja serwerowa dojdzie razem
z backendem (te same reguły powtórzone po stronie API).

## Mock API — `services.ts`

To udawany backend. Trzyma dane w `localStorage` i każda funkcja zwraca `Promise`
(czyli zachowuje się jak prawdziwe zapytanie sieciowe). Dlatego w komponentach
używamy `await`. Gdy powstanie prawdziwy backend, podmieniamy tylko ten plik —
reszta aplikacji zostaje bez zmian, bo nie wie, skąd pochodzą dane.

## Uprawnienia — kto co może

Rozróżniamy dwie role: **admin** i **user**. Podział obowiązków:

- **Admin** zarządza treścią: dodaje, edytuje i usuwa filmy/seriale. Robi to
  z panelu CMS (`/admin`) lub formularza (`/movies/add`, `/movies/:id/edit`).
- **Zwykły użytkownik** korzysta z treści: dodaje filmy do listy do obejrzenia,
  oznacza je jako obejrzane, ocenia i pisze recenzje.

Dodawanie/edycja są chronione w trzech miejscach (tak jak panel CMS):
link w menu widoczny tylko dla admina, trasa z `requiresAdmin` w routerze,
oraz przyciski Edytuj/Usuń na stronie filmu pokazywane tylko adminowi
(`v-if="user?.role === 'admin'"`).

## Recenzje i oceny

Recenzja to ocena 1–10 plus opcjonalny tekst. Zasady:

- Jeden użytkownik = jedna recenzja na film (mock to pilnuje).
- Recenzje są w osobnym magazynie `mock_reviews` w `localStorage`.
- Średnia ocena filmu (`avg_rating`) jest **przeliczana** z recenzji za każdym
  razem, gdy ktoś doda/zmieni/usunie recenzję — robi to funkcja `recomputeAvg`
  w `services.ts`.
- Na stronie filmu (`MovieDetails.vue`) jest formularz: jeśli użytkownik nie ma
  jeszcze recenzji — dodaje nową, jeśli ma — edytuje istniejącą.

## Filtr filmy / seriale (zakładki)

Na liście filmów i na liście do obejrzenia są trzy zakładki: Wszystkie / Filmy /
Seriale. Zmienna `type` trzyma wybór (`''`, `'movie'`, `'series'`).

- Na liście filmów filtr idzie do API (`moviesApi.list({ media_type })`).
- Na liście do obejrzenia filtrujemy już pobrane dane przez `computed` —
  `filtered` to lista zawężona do wybranego typu.

## Wygląd — Bootstrap 5

Cały wygląd opiera się na **Bootstrapie 5** (gotowy framework CSS). Włączamy go
jedną linią w `main.ts` (`import 'bootstrap/dist/css/bootstrap.min.css'`).
Tryb ciemny to wbudowana funkcja Bootstrapa — atrybut `data-bs-theme="dark"`
na znaczniku `<html>` w `index.html`, nic własnego.

Najczęstsze klasy, które widać w szablonach:
- `container`, `row`, `col` — układ i siatka responsywna,
- `card`, `card-body` — kafelki (filmy, formularze, recenzje),
- `btn btn-primary`, `btn-outline-secondary`, `btn-outline-danger` — przyciski,
- `form-control`, `form-select`, `form-label` — pola formularzy,
- `is-invalid` + `invalid-feedback` — pokazywanie błędów walidacji (czerwone),
- `table table-hover` — tabele w panelu CMS,
- `nav nav-pills` — zakładki filmy/seriale,
- `list-group` — lista do obejrzenia,
- `badge` — etykiety (ocena, rola użytkownika).

Własnego CSS jest minimum — plik `style.css` ma tylko dwie klasy
(`.poster`, `.poster-lg`) na kafelki z emoji zamiast plakatów, bo tego
Bootstrap nie ma gotowego.

## Dlaczego Vue, a nie React?

Uczciwa odpowiedź: czytelny podział pliku na logikę i szablon, a szablon
przypomina zwykły HTML (`v-if`, `v-for`, `@click`) — łatwiej się w nim odnaleźć.
To kwestia preferencji; oba frameworki realizują to samo zadanie (SPA z routingiem
i komponentami).
