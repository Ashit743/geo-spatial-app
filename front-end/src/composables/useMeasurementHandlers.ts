import type mapboxgl from 'mapbox-gl'
import type { MeasurementPoint, MeasurementLine } from '@/types/measurement'

export function useMeasurementHandlers() {
  const createPoint = (lngLat: mapboxgl.LngLat, groupId?: number): MeasurementPoint => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [lngLat.lng, lngLat.lat]
    },
    properties: {
      id: String(new Date().getTime()),
      measurementGroup: groupId || new Date().getTime()
    }
  })

  const createLine = (points: MeasurementPoint[], groupId: number): MeasurementLine => ({
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: points.map(p => p.geometry.coordinates)
    },
    properties: {
      measurementGroup: groupId
    }
  })

  const updateSource = (map: mapboxgl.Map, data: any) => {
    (map.getSource('measurements') as mapboxgl.GeoJSONSource).setData(data)
  }

  const setupMouseHandlers = (map: mapboxgl.Map, isMeasuring: Ref<boolean>) => {
    map.on('mousemove', (e) => {
      if (!isMeasuring.value) return

      const features = map.queryRenderedFeatures(e.point, {
        layers: ['measure-points']
      })
      map.getCanvas().style.cursor = features.length ? 'pointer' : 'crosshair'
    })
  }

  return {
    createPoint,
    createLine,
    updateSource,
    setupMouseHandlers
  }
} 