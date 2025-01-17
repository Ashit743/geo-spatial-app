<script setup lang="ts">
import { onMounted, ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<mapboxgl.Map | null>(null)

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

// onMounted(() => {
//   if (mapContainer.value) {
//     map.value = new mapboxgl.Map({
//       container: mapContainer.value,
//       style: 'mapbox://styles/mapbox/streets-v11',
//       center: [77.2090, 28.6139], // Longitude, Latitude (e.g., New Delhi)
//       zoom: 10,
//     })

//     map.value.addControl(new mapboxgl.NavigationControl())
//   }
// })
</script>

<template>
<!-- <div ref="mapContainer" class="w-full h-[calc(100vh-4rem)]"></div> -->
<div class="map-placeholder">
    <div class="placeholder-content">
      <h2 class="text-2xl font-bold mb-2">Map Placeholder</h2>
      <p>This is a placeholder for the map component.</p> 
      <p>Actual map functionality will be implemented later.</p>
    </div>
  </div>
</template>