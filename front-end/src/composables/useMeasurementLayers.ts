import type mapboxgl from 'mapbox-gl'
import { measurementLayerStyles } from '@/config/measurementLayers'

export function useMeasurementLayers() {
  const initializeLayers = (map: mapboxgl.Map, initialData: any) => {
    // Add source
    map.addSource('measurements', {
      type: 'geojson',
      data: initialData
    })

    // Add layers
    map.addLayer(measurementLayerStyles.points)
    map.addLayer(measurementLayerStyles.lines)
  }

  const removeLayers = (map: mapboxgl.Map) => {
    if (map.getLayer('measure-points')) map.removeLayer('measure-points')
    if (map.getLayer('measure-lines')) map.removeLayer('measure-lines')
    if (map.getSource('measurements')) map.removeSource('measurements')
  }

  return {
    initializeLayers,
    removeLayers
  }
} 