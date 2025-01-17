<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Dataset {
  id: string;
  name: string;
  file: File;
  visible: boolean;
  layerId: string;
}

const props = defineProps<{
  datasets: Dataset[]
}>()

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<mapboxgl.Map | null>(null)
const error = ref<string | null>(null)

// Store the bounds of all uploaded files
let allBounds = new mapboxgl.LngLatBounds()

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN
if (!mapboxToken) {
  error.value = "Mapbox token is missing. Please check your environment variables."
} else {
  mapboxgl.accessToken = mapboxToken
}

// Initialize Map
const initializeMap = () => {
  if (mapContainer.value && !map.value && !error.value) {
    try {
      map.value = new mapboxgl.Map({
        container: mapContainer.value,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [0, 0],
        zoom: 1,
      })
      
      map.value.addControl(new mapboxgl.NavigationControl())
      map.value.addControl(new mapboxgl.FullscreenControl())
      
      map.value.on('load', () => {
        console.log('Map loaded successfully')
      })
    } catch (e) {
      console.error("Error initializing map:", e)
      error.value = "Failed to initialize map. Please check your Mapbox token and network connection."
    }
  }
}

// Load GeoJSON Data from File
const loadGeoJSONData = async (dataset: Dataset) => {
  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      const geojsonData = JSON.parse(e.target?.result as string)
      if (map.value) {
        const bounds = new mapboxgl.LngLatBounds()
        
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

        allBounds = allBounds.extend(bounds)

        map.value.addSource(dataset.id, {
          type: 'geojson',
          data: geojsonData
        })

        map.value.addLayer({
          id: dataset.layerId,
          type: 'fill',
          source: dataset.id,
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.7
          },
          layout: {
            visibility: dataset.visible ? 'visible' : 'none'
          }
        })

        updateMapBounds()
      }
    } catch (e) {
      console.error('Error parsing or adding GeoJSON data:', e)
      error.value = `Error loading dataset ${dataset.name}. Please check the file format.`
    }
  }

  reader.onerror = (e) => {
    console.error('Error reading file:', e)
    error.value = `Error reading file ${dataset.name}. Please try uploading again.`
  }

  reader.readAsText(dataset.file)
}

const updateMapBounds = () => {
  if (map.value) {
    const visibleBounds = new mapboxgl.LngLatBounds()
    props.datasets.forEach(dataset => {
      if (dataset.visible) {
        const source = map.value.getSource(dataset.id) as mapboxgl.GeoJSONSource
        if (source) {
          const data = source.serialize().data as GeoJSON.FeatureCollection
          data.features.forEach((feature: any) => {
            if (feature.geometry.type === 'Polygon') {
              feature.geometry.coordinates[0].forEach((coord: [number, number]) => {
                visibleBounds.extend(coord)
              })
            }
            if (feature.geometry.type === 'Point') {
              visibleBounds.extend(feature.geometry.coordinates)
            }
          })
        }
      }
    })

    if (!visibleBounds.isEmpty()) {
      map.value.fitBounds(visibleBounds, { padding: 50, maxZoom: 15 })
    }
  }
}

watch(() => props.datasets, (newDatasets) => {
  newDatasets.forEach(dataset => {
    if (dataset.file.name.endsWith('.geojson')) {
      loadGeoJSONData(dataset)
    }
  })
}, { deep: true })

watch(() => props.datasets.map(d => d.visible), () => {
  if (map.value) {
    props.datasets.forEach(dataset => {
      if (map.value) {
        map.value.setLayoutProperty(dataset.layerId, 'visibility', dataset.visible ? 'visible' : 'none')
      }
    })
    updateMapBounds()
  }
}, { deep: true })

onMounted(() => {
  initializeMap()
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})
</script>

<template>
  <div class="map-container">
    <div v-if="error" class="error-message" role="alert">
      <strong class="font-bold">Error:</strong>
      <span>{{ error }}</span>
    </div>
    <div v-else ref="mapContainer" class="map"></div>
  </div>
</template>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 4rem);
}

.map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #FEE2E2;
  border: 1px solid #F87171;
  color: #B91C1C;
  padding: 1rem;
  border-radius: 0.375rem;
  max-width: 90%;
  text-align: center;
}
</style>

