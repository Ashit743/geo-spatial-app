import { createRouter, createWebHistory } from 'vue-router';

// Import your components
import Home from '../views/Home.vue';
import MapPage from '../views/MapPage.vue';
import NotFound from '../views/NotFound.vue';

// Define routes
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/map',
    name: 'MapPage',
    component: MapPage,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound, // Fallback route for 404
  },
];

// Create the router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
