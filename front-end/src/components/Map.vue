<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useDatasetStore, type Dataset } from '@/stores/useDatasetStore'
import { storeToRefs } from 'pinia'
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import MapHoverCard from './MapHoverCard.vue'
import * as turf from '@turf/turf'

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

const draw = ref<any>(null);
const measureDraw = ref<any>(null);
const isMeasuring = ref(false);

const hoveredFeature = ref<any>(null);
const hoverPopup = ref<mapboxgl.Popup | null>(null);
const hoverCoordinates = ref<{ x: number; y: number }>({ x: 0, y: 0 });

const distanceGeojson = ref({
  type: 'FeatureCollection',
  features: []
})

const linestring = ref({
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: []
  }
})

const setupDrawEvents = () => {
  if (map.value && draw.value) {
    map.value.on('draw.create', async (e) => {
      // @ts-ignore

      await saveDrawnShapes(e.features);
    });

    map.value.on('draw.update', async (e) => {
      // @ts-ignore

      await saveDrawnShapes(e.features);
    });

    map.value.on('draw.delete', (e) => {
      // @ts-ignore

      deleteShapes(e.features);
    });
  }
};

const setupHoverInteraction = () => {
  if (!map.value) return;

  map.value.on('mousemove', (e) => {
    // Only query features from our specific layers
    const features = map.value!.queryRenderedFeatures(e.point, {
      layers: datasets.value.map(d => d.layerId) // Only look at our dataset layers
    });
    
    if (features.length > 0) {
      hoveredFeature.value = features[0];
      hoverCoordinates.value = { x: e.point.x, y: e.point.y };
    } else {
      hoveredFeature.value = null;
    }
  });

  map.value.on('mouseout', () => {
    hoveredFeature.value = null;
  });
};

// Save new or updated shapes
const saveDrawnShapes = async (features: GeoJSON.Feature[]) => {
  // Add or update these features in the store
  const newFeatures = features.map((feature) => ({
    id: feature.id,
    geojson: {
      type: "FeatureCollection", 
      features: [feature]
    },
  }));
  
  const datasetsToAdd = newFeatures.map((f) => ({
    id: String(f.id),
    name: `Shape-${f.id}`,
    file: new File([], String(f.id)),
    visible: true,
    layerId: `layer-${f.id}`,
    geojson: f.geojson, 
    selected: true,
  }));
  console.log('Transformed datasets:', datasetsToAdd);

  store.addDatasets(datasetsToAdd);
  
  // Wait for all datasets to be loaded
  await Promise.all(datasetsToAdd.map(dataset => loadGeoJSONData(dataset)));
  
  // Now update the bounds after all data is loaded
  updateMapBounds();
};

// Delete shapes from the store
const deleteShapes = (features: GeoJSON.Feature[]) => {
  features.forEach((feature) => {
    if (map.value) {
      const featureId = String(feature.id);
      
      // Find the dataset that contains this feature
      const datasetToDelete = datasets.value.find(dataset => 
        dataset.geojson?.features.some(f => String(f.id) === featureId)
      );

      if (datasetToDelete) {
        // Remove the layer and source from the map
        const layerId = datasetToDelete.layerId;
        const sourceId = datasetToDelete.id;

        // Remove the outline layer if it exists
        if (map.value.getLayer(`${layerId}-outline`)) {
          map.value.removeLayer(`${layerId}-outline`);
        }

        // Remove the main layer
        if (map.value.getLayer(layerId)) {
          map.value.removeLayer(layerId);
        }

        // Remove the source
        if (map.value.getSource(sourceId)) {
          map.value.removeSource(sourceId);
        }

        // Remove from store
        store.removeDataset(datasetToDelete.id);
      }
    }
  });

  // Update bounds after deletion
  updateMapBounds();
};

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
        setupDrawEvents()
        setupHoverInteraction()
        loadSavedShapes()
        initializeDrawingControls()
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
      // @ts-ignore
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
  if (!map.value || datasets.value.length === 0) return;

  // Collect all coordinates from all VISIBLE features
  const bounds = new mapboxgl.LngLatBounds();
  let hasValidBounds = false;

  datasets.value.forEach(dataset => {
    // Only process visible datasets
    if (dataset.visible && dataset.geojson && dataset.geojson.features) {
      dataset.geojson.features.forEach(feature => {
        if (feature.geometry) {
          // Handle different geometry types
          switch (feature.geometry.type) {
            case 'Polygon':
              feature.geometry.coordinates[0].forEach((coord: number[]) => {
                bounds.extend(coord as [number, number]);
              });
              hasValidBounds = true;
              break;
            
            case 'LineString':
              feature.geometry.coordinates.forEach((coord: number[]) => {
                bounds.extend(coord as [number, number]);
              });
              hasValidBounds = true;
              break;
            
            case 'Point':
              bounds.extend(feature.geometry.coordinates as [number, number]);
              hasValidBounds = true;
              break;

            case 'MultiPolygon':
              feature.geometry.coordinates.forEach((polygon: number[][][]) => {
                polygon[0].forEach((coord: number[]) => {
                  bounds.extend(coord as [number, number]);
                });
              });
              hasValidBounds = true;
              break;
          }
        }
      });
    }
  });

  // Only fit bounds if we have valid coordinates from visible layers
  if (hasValidBounds) {
    map.value.fitBounds(bounds, {
      padding: 50,
      maxZoom: 16,
      duration: 1000
    });
  }
};

watch(datasets, (newDatasets) => {
  newDatasets.forEach((dataset) => {
    if (dataset.file && dataset.file.name && dataset.file.name.endsWith('.geojson')) {
      loadGeoJSONData(dataset);
    }
  });
}, { deep: true });

watch(visibleDatasets, () => {
  if (map.value) {
    datasets.value.forEach(dataset => {
      if (map.value && map.value.getLayer(dataset.layerId)) {
        map.value.setLayoutProperty(
          dataset.layerId,
          'visibility',
          dataset.visible ? 'visible' : 'none'
        );
      }
    });
    updateMapBounds();
  }
}, { deep: true });

watch(
  () => datasets.value,
  (newDatasets) => {
    const datasetsToSave = newDatasets.map(dataset => ({
      ...dataset,
      geojson: dataset.geojson,
      file: {
        name: dataset.file.name,
        type: dataset.file.type
      }
    }));
    localStorage.setItem('savedShapes', JSON.stringify(datasetsToSave));
  },
  { deep: true }
);

const loadSavedShapes = async () => {
  if (!map.value) return;
  
  const savedShapes = JSON.parse(localStorage.getItem('savedShapes') || '[]');
  console.log('Retrieved saved shapes:', savedShapes);

  if (savedShapes.length > 0) {
    // First add to store
    store.addDatasets(savedShapes);

    // Wait for map to be ready
    if (!map.value.loaded()) {
      await new Promise(resolve => map.value!.once('load', resolve));
    }

    // Load each saved dataset into the map
    for (const dataset of savedShapes) {
      if (dataset.geojson) {
        try {
          await loadGeoJSONData(dataset);
          
          // Add to draw if it's a drawn shape
          if (draw.value && dataset.geojson.features[0]) {
            draw.value.add(dataset.geojson.features[0]);
          }

          // Ensure the layer is visible if it should be
          if (map.value && map.value.getLayer(dataset.layerId)) {
            map.value.setLayoutProperty(
              dataset.layerId,
              'visibility',
              dataset.visible ? 'visible' : 'none'
            );
          }
        } catch (error) {
          console.error('Error loading dataset:', dataset.id, error);
        }
      }
    }

    updateMapBounds();
  }
};

const initializeDrawingControls = () => {
  if (!map.value) return;

  // Initialize shape drawing control
  draw.value = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      line_string: true,
      point: true,
      trash: true
    }
  });

  // Initialize measurement control
  measureDraw.value = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      line_string: true,
      trash: true
    },
    styles: [
      // Measurement line style
      {
        id: 'measure-line',
        type: 'line',
        filter: ['all', ['==', '$type', 'LineString']],
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#FF4444',
          'line-width': 3,
          'line-dasharray': [2, 2]
        }
      },
      // Measurement points style
      {
        id: 'measure-points',
        type: 'circle',
        filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex']],
        paint: {
          'circle-radius': 6,
          'circle-color': '#fff',
          'circle-stroke-color': '#FF4444',
          'circle-stroke-width': 2
        }
      }
    ]
  });

  // Add shape drawing control initially
  map.value.addControl(draw.value, 'top-left');

  // Add measurement events
  map.value.on('draw.create', (e) => {
    if (isMeasuring.value) {
      updateMeasurement(e);
    } else {
      // @ts-ignore

      saveDrawnShapes(e.features);
    }
  });

  map.value.on('draw.update', (e) => {
    if (isMeasuring.value) {
      updateMeasurement(e);
    } else {
      // @ts-ignore

      saveDrawnShapes(e.features);
    }
  });

  map.value.on('draw.delete', (e) => {
    if (isMeasuring.value) {
      // Remove measurement labels
      const layers = map.value?.getStyle().layers || [];
      layers.forEach((layer: any) => {
        if (layer.id.startsWith('measure-label')) {
          map.value?.removeLayer(layer.id);
        }
      });
    } else {
      // @ts-ignore

      deleteShapes(e.features);
    }
  });
};

const toggleMeasurement = () => {
  isMeasuring.value = !isMeasuring.value;

  if (isMeasuring.value) {
    // Switch to measurement mode
    map.value?.removeControl(draw.value);
    map.value?.addControl(measureDraw.value, 'top-left');
    measureDraw.value.changeMode('draw_line_string');

    // Update measurements for existing lines
    const features = measureDraw.value.getAll().features;
    features.forEach(feature => {
      updateMeasurement({ features: [feature] });
    });
  } else {
    // Switch back to shape drawing mode
    map.value?.removeControl(measureDraw.value);
    map.value?.addControl(draw.value, 'top-left');
    measureDraw.value.deleteAll(); // Clear measurements
  }
};

const updateMeasurement = (e: any) => {
  if (!isMeasuring.value) return;

  const line = e.features[0];
  if (!line || line.geometry.type !== 'LineString') return;

  // Calculate distance
  const distance = turf.length(line, { units: 'kilometers' });
  const miles = distance * 0.621371;

  // Remove old measurement layers
  const layers = map.value?.getStyle().layers || [];
  layers.forEach((layer: any) => {
    if (layer.id.startsWith('measure-label')) {
      map.value?.removeLayer(layer.id);
    }
  });

  // Add measurement label at the midpoint of the line
  const coordinates = line.geometry.coordinates;
  const midIndex = Math.floor(coordinates.length / 2);
  const midpoint = coordinates[midIndex];

  map.value?.addLayer({
    id: `measure-label-${line.id}`,
    type: 'symbol',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: midpoint
        },
        properties: {}
      }
    },
    layout: {
      'text-field': `${distance.toFixed(2)} km\n(${miles.toFixed(2)} mi)`,
      'text-font': ['Arial Unicode MS Bold'],
      'text-size': 14,
      'text-anchor': 'center',
      'text-offset': [0, -1]
    },
    paint: {
      'text-color': '#FF4444',
      'text-halo-color': '#ffffff',
      'text-halo-width': 2
    }
  });
};

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
    <div ref="mapContainer" class="h-full w-full">
      <MapHoverCard
        v-if="hoveredFeature"
        :feature="hoveredFeature"
        class="absolute z-50 pointer-events-none"
        :style="{
          left: `${hoverCoordinates.x + 10}px`,
          top: `${hoverCoordinates.y + 10}px`
        }"
      />
    </div>
    <div class="absolute top-4 left-16 px-4 py-2 bg-black/75 rounded-md shadow-md z-10">
      <span class="font-semibold text-sm text-white">
        {{ isMeasuring ? '📏 Distance Measurement Mode' : '✏️ Shape Drawing Mode' }}
      </span>
    </div>
    <button
      @click="toggleMeasurement"
      class="absolute bottom-4 right-4 px-4 py-2 bg-black/75 rounded-md shadow-md z-10 hover:bg-black/90"
      :class="{ 'bg-red-500/90 hover:bg-red-500': isMeasuring }"
    >
      <span class="flex items-center gap-2 font-medium text-white">
        <span v-if="isMeasuring">❌ Exit Measurement</span>
        <span v-else>📏 Measure Distance</span>
      </span>
    </button>
  </div>
</template>

<style>
@import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

.mapboxgl-ctrl-group {
  margin: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.mapboxgl-ctrl-group button {
  background-color: white;
}

.mapboxgl-ctrl-group button:hover {
  background-color: #f8f8f8;
}
</style>

