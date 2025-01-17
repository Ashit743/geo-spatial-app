<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const props = defineProps<{
  uploadedFiles: File[] // Prop to receive files
}>()

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<mapboxgl.Map | null>(null)

// Store the bounds of all uploaded files
let allBounds = new mapboxgl.LngLatBounds()

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

// Initialize Map
const initializeMap = () => {
  if (mapContainer.value && !map.value) { // Ensure map is only initialized once
    map.value = new mapboxgl.Map({
      container: mapContainer.value,
      style: 'mapbox://styles/mapbox/streets-v12', // Initial map style
      center: [0, 0], // World view center
      zoom: 1, // Initial zoom level
    })
    
    map.value.addControl(new mapboxgl.NavigationControl())
  }
}

// Load GeoJSON Data from File
const loadGeoJSONData = async (file: File) => {
  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      const geojsonData = JSON.parse(e.target?.result as string)
      if (map.value) {
        const bounds = new mapboxgl.LngLatBounds()
        
        // Extend the bounds with the new file's features
        geojsonData.features.forEach((feature: any) => {
          if (feature.geometry.type === 'Polygon') {
            feature.geometry.coordinates[0].forEach((coord: [number, number]) => {
              bounds.extend(coord)
            })
          }
          if (feature.geometry.type === 'Point') {
            bounds.extend(feature.geometry.coordinates)
          }
        })

        // Extend allBounds with the new file's bounds
        allBounds = allBounds.extend(bounds)

        // Fit the map to include all bounds from all files
        map.value.fitBounds(allBounds, { padding: 50 })
      }
    } catch (e) {
      console.error('Error parsing GeoJSON file:', e)
    }
  }

  reader.readAsText(file)
}

// Watch for uploaded files and trigger GeoJSON loading
watch(() => props.uploadedFiles, (newFiles, oldFiles) => {
  // Load new files and update bounds
  newFiles.forEach(file => {
    if (file.name.endsWith('.geojson')) {
      loadGeoJSONData(file) // Load GeoJSON data and update bounds
    }
    // Handle other file types (.kml, .tiff) if needed
  })
}, { deep: true })

onMounted(() => {
  initializeMap()
})
</script>

<template>
  <div ref="mapContainer" class="w-full h-[calc(100vh-4rem)]"></div>
</template>

<style scoped>
.w-full {
  width: 100%;
}

.h-calc-100vh-4rem {
  height: calc(100vh - 4rem);
}
</style>
