<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useDatasetStore } from '@/stores/useDatasetStore'
import { storeToRefs } from 'pinia'

const store = useDatasetStore()
const { datasets, visibleDatasets, defaultGeoJSON } = storeToRefs(store)

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
        loadDefaultGeoJSON()
      })
    } catch (e) {
      console.error("Error initializing map:", e)
      error.value = "Failed to initialize map. Please check your Mapbox token and network connection."
    }
  }
}

// Load Default GeoJSON
const loadDefaultGeoJSON = () => {
  if (map.value) {
    map.value.addSource('default', {
      type: 'geojson',
      data: defaultGeoJSON.value
    })

    map.value.addLayer({
      id: 'default-layer',
      type: 'fill',
      source: 'default',
      paint: {
        'fill-color': '#888888',
        'fill-opacity': 0.4
      }
    })
  }
}

// Load GeoJSON Data from File or JSON
const loadGeoJSONData = async (dataset: Dataset) => {
  if (map.value) {
    const geojsonData = dataset.geojson || await readFileAsJSON(dataset.file)
    
    if (!dataset.geojson) {
      store.updateDatasetGeoJSON(dataset.id, geojsonData)
    }

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

    if (map.value.getSource(dataset.id)) {
      (map.value.getSource(dataset.id) as mapboxgl.GeoJSONSource).setData(geojsonData)
    } else {
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
    }

    updateMapBounds()
  }
}

const readFileAsJSON = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        resolve(json)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = (e) => reject(e)
    reader.readAsText(file)
  })
}

const updateMapBounds = () => {
  if (map.value) {
    const visibleBounds = new mapboxgl.LngLatBounds()
    visibleDatasets.value.forEach(dataset => {
      const source = map.value!.getSource(dataset.id) as mapboxgl.GeoJSONSource
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
    })

    if (!visibleBounds.isEmpty()) {
      map.value.fitBounds(visibleBounds, { padding: 50, maxZoom: 15 })
    }
  }
}

watch(datasets, (newDatasets) => {
  newDatasets.forEach(dataset => {
    if (dataset.file.name.endsWith('.geojson')) {
      loadGeoJSONData(dataset)
    }
  })
}, { deep: true })

watch(visibleDatasets, () => {
  if (map.value) {
    datasets.value.forEach(dataset => {
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
  <div class="h-full w-full relative">
    <div v-if="error" class="absolute inset-0 flex items-center justify-center bg-background/80 z-10" role="alert">
      <div class="bg-destructive text-destructive-foreground px-4 py-2 rounded-md">
        <strong class="font-bold">Error:</strong>
        <span>{{ error }}</span>
      </div>
    </div>
    <div ref="mapContainer" class="h-full w-full"></div>
  </div>
</template>

