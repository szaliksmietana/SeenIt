import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../stores/auth';

import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import MovieList from '../pages/MovieList.vue';
import MovieDetails from '../pages/MovieDetails.vue';
import MovieForm from '../pages/MovieForm.vue';
import Watchlist from '../pages/Watchlist.vue';
import Profile from '../pages/Profile.vue';
import Admin from '../pages/Admin.vue';

// Lista tras. Pole "meta" to etykiety, które sprawdza strażnik niżej:
//   requiresAuth  → trzeba być zalogowanym
//   requiresAdmin → trzeba mieć rolę admina (panel CMS)
const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Register },

  { path: '/movies', component: MovieList, meta: { requiresAuth: true } },
  // Dodawanie i edycja filmów — tylko administrator (zarządzanie treścią przez CMS).
  { path: '/movies/add', component: MovieForm, props: { mode: 'create' }, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/movies/:id', component: MovieDetails, meta: { requiresAuth: true } },
  { path: '/movies/:id/edit', component: MovieForm, props: { mode: 'edit' }, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/watchlist', component: Watchlist, meta: { requiresAuth: true } },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },

  { path: '/admin', component: Admin, meta: { requiresAuth: true, requiresAdmin: true } },

  // Wejście na "/" lub nieznany adres → lista filmów.
  { path: '/', redirect: '/movies' },
  { path: '/:pathMatch(.*)*', redirect: '/movies' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// STRAŻNIK TRAS — uruchamia się przed każdym przejściem na nową stronę.
// Zwrócenie ścieżki ('/login') oznacza przekierowanie; brak zwrotu = wpuść.
router.beforeEach((to) => {
  const { user } = useAuth();

  // Trasa wymaga logowania, a nikt nie jest zalogowany → na logowanie.
  if (to.meta.requiresAuth && !user.value) {
    return '/login';
  }
  // Trasa wymaga admina, a użytkownik nim nie jest → na listę filmów.
  if (to.meta.requiresAdmin && user.value?.role !== 'admin') {
    return '/movies';
  }
});

export default router;
