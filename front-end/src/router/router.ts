import { createRouter, createWebHistory } from "vue-router";

// Import your components
import Home from "@/views/Home.vue";
import MapPage from "@/views/MapPage.vue";
import NotFound from "@/views/NotFound.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";


// Define routes
const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { requiresAuth: true } 
  },
  { path: "/login", 
    name: "Login", 
    component: Login,
  },
  { path: "/register", 
    name: "Register", 
    component: Register 
  },
  {
    path: "/map",
    name: "MapPage",
    component: MapPage,
    meta: { requiresAuth: true } 
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound, // Fallback route for 404
  },
];

// Create the router
const router = createRouter({
  history: createWebHistory(),
  routes,
});


router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.matched.some(record => record.meta.requiresAuth) && !token) {
    next('/login');
  } else {
    next();
  }
});

export default router;
