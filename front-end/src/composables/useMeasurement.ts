import { ref } from 'vue'
import type mapboxgl from 'mapbox-gl'
import { useMeasurementHandlers } from './useMeasurementHandlers'
import { useMeasurementLayers } from './useMeasurementLayers'
import { updateDistanceLabel } from '@/utils/distanceLabel'
import type { GeoJSONCollection } from '@/types/measurement'

export function useMeasurement() {
  const isMeasuring = ref(false)
  const startNewMeasurement = ref(true)
  const distanceGeojson = ref<GeoJSONCollection>({
    type: 'FeatureCollection',
    features: []
  })

  const { createPoint, createLine, updateSource, setupMouseHandlers } = useMeasurementHandlers()
  const { initializeLayers, removeLayers } = useMeasurementLayers()

  const initializeMeasurement = (map: mapboxgl.Map) => {
    initializeLayers(map, distanceGeojson.value)
    setupMeasurementHandlers(map)
    setupMouseHandlers(map, isMeasuring)
  }

  const handleMeasurementClick = (map: mapboxgl.Map) => (e: mapboxgl.MapMouseEvent) => {
    if (!isMeasuring.value) return

    if (startNewMeasurement.value) {
      const point = createPoint(e.lngLat)
      distanceGeojson.value.features.push(point)
      startNewMeasurement.value = false
    } else {
      const lastPoint = distanceGeojson.value.features[distanceGeojson.value.features.length - 1]
      const point = createPoint(e.lngLat, lastPoint.properties.measurementGroup)
      distanceGeojson.value.features.push(point)
      updateMeasurementLine(map, point.properties.measurementGroup)
    }

    updateSource(map, distanceGeojson.value)
  }

  const setupMeasurementHandlers = (map: mapboxgl.Map) => {
    map.on('click', handleMeasurementClick(map))
  }

  const updateMeasurementLine = (map: mapboxgl.Map, groupId: number) => {
    const currentPoints = distanceGeojson.value.features.filter(
      f => f.properties.measurementGroup === groupId && f.geometry.type === 'Point'
    )

    if (currentPoints.length > 1) {
      const newLine = createLine(currentPoints as any[], groupId)
      updateMeasurementFeatures(groupId, newLine)
      updateDistanceLabel(map, newLine, groupId)
    }
  }

  const updateMeasurementFeatures = (groupId: number, newLine: any) => {
    distanceGeojson.value.features = distanceGeojson.value.features.filter(
      f => f.geometry.type !== 'LineString' || 
           f.properties.measurementGroup !== groupId
    )
    distanceGeojson.value.features.push(newLine)
  }

  const toggleMeasurement = (map: mapboxgl.Map) => {
    isMeasuring.value = !isMeasuring.value
    
    if (isMeasuring.value) {
      map.getCanvas().style.cursor = 'crosshair'
      startNewMeasurement.value = true
    } else {
      cleanupMeasurement(map)
    }
  }

  const cleanupMeasurement = (map: mapboxgl.Map) => {
    map.getCanvas().style.cursor = ''
    distanceGeojson.value.features = []
    updateSource(map, distanceGeojson.value)
    removeLayers(map)
  }

  const handleEscape = () => {
    if (isMeasuring.value) {
      startNewMeasurement.value = true
      const existingFeatures = distanceGeojson.value.features.filter(
        f => f.geometry.type === 'LineString' || f.properties.measurementGroup
      )
      distanceGeojson.value.features = existingFeatures
    }
  }

  return {
    isMeasuring,
    startNewMeasurement,
    initializeMeasurement,
    toggleMeasurement,
    cleanupMeasurement,
    handleEscape
  }
} 