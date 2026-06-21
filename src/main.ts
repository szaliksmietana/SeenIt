import { createApp } from 'vue';
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import App from './App.vue';
import router from './router';
import { useAuth } from './stores/auth';
import './style.css';

// Najpierw sprawdzamy token (init), a dopiero potem montujemy aplikację.
// Dzięki temu strażnik tras od razu wie, czy ktoś jest zalogowany.
const { init } = useAuth();

init().then(() => {
  const app = createApp(App);
  app.use(router);
  // Biblioteka do powiadomień (zielone/czerwone "toasty" w rogu ekranu).
  app.use(Vue3Toastify, { position: 'top-right', autoClose: 2500 } as ToastContainerOptions);
  app.mount('#app');
});
