import type { MeasurementLayerStyles } from '@/types/measurement'

export const measurementLayerStyles: MeasurementLayerStyles = {
  points: {
    id: 'measure-points',
    type: 'circle',
    source: 'measurements',
    paint: {
      'circle-radius': 5,
      'circle-color': '#FF4444',
      'circle-stroke-color': '#fff',
      'circle-stroke-width': 2
    },
    filter: ['in', '$type', 'Point']
  },
  lines: {
    id: 'measure-lines',
    type: 'line',
    source: 'measurements',
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': '#FF4444',
      'line-width': 2.5,
      'line-dasharray': [2, 2]
    },
    filter: ['in', '$type', 'LineString']
  }
} 