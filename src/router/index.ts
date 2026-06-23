import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../stores/auth';

import Home from '../pages/Home.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import ForgotPassword from '../pages/ForgotPassword.vue';
import MovieList from '../pages/MovieList.vue';
import MovieDetails from '../pages/MovieDetails.vue';
import MovieForm from '../pages/MovieForm.vue';
import Watchlist from '../pages/Watchlist.vue';
import Profile from '../pages/Profile.vue';
import Admin from '../pages/Admin.vue';

const routes = [
  // Publiczne
  { path: '/',                component: Home },
  { path: '/login',           component: Login },
  { path: '/register',        component: Register },
  { path: '/forgot-password', component: ForgotPassword },
  { path: '/movies',          component: MovieList },
  { path: '/movies/:id',      component: MovieDetails },

  // Tylko admin
  { path: '/movies/add',      component: MovieForm, props: { mode: 'create' }, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/movies/:id/edit', component: MovieForm, props: { mode: 'edit'   }, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin',           component: Admin,                                meta: { requiresAuth: true, requiresAdmin: true } },

  // Wymaga logowania
  { path: '/watchlist', component: Watchlist, meta: { requiresAuth: true } },
  { path: '/profile',   component: Profile,   meta: { requiresAuth: true } },

  // Nieznany adres → strona główna
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const { user } = useAuth();
  if (to.meta.requiresAuth && !user.value)   return '/login';
  if (to.meta.requiresAdmin && user.value?.role !== 'admin') return '/movies';
});

export default router;