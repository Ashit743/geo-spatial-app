import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/router'
import { createPinia } from 'pinia'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

const pinia = createPinia();
createApp(App).use(router).use(pinia).mount('#app')
