import type mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf'

export const updateDistanceLabel = (map: mapboxgl.Map, line: any, groupId: number) => {
  removeOldLabel(map, groupId)
  const { distance, miles } = calculateDistance(line)
  addDistanceLabel(map, line, distance, miles, groupId)
}

const removeOldLabel = (map: mapboxgl.Map, groupId: number) => {
  const layers = map.getStyle().layers || []
  layers.forEach((layer: any) => {
    if (layer.id === `measure-label-${groupId}`) {
      map.removeLayer(layer.id)
    }
  })

  if (map.getSource(`measure-label-${groupId}`)) {
    map.removeSource(`measure-label-${groupId}`)
  }
}

const calculateDistance = (line: any) => {
  const distance = turf.length(line, { units: 'kilometers' })
  const miles = distance * 0.621371
  return { distance, miles }
}

const addDistanceLabel = (
  map: mapboxgl.Map,
  line: any,
  distance: number,
  miles: number,
  groupId: number
) => {
  const coordinates = line.geometry.coordinates
  const midpoint = coordinates[Math.floor(coordinates.length / 2)]

  map.addSource(`measure-label-${groupId}`, {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: midpoint
      },
      properties: {}
    }
  })

  map.addLayer({
    id: `measure-label-${groupId}`,
    type: 'symbol',
    source: `measure-label-${groupId}`,
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
  })
} 