export interface MeasurementPoint {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: {
    id: string
    measurementGroup: number
  }
}

export interface MeasurementLine {
  type: 'Feature'
  geometry: {
    type: 'LineString'
    coordinates: [number, number][]
  }
  properties: {
    measurementGroup: number
  }
}

export interface GeoJSONCollection {
  type: 'FeatureCollection'
  features: (MeasurementPoint | MeasurementLine)[]
}

export interface MeasurementLayerStyles {
  points: mapboxgl.CircleLayer
  lines: mapboxgl.LineLayer
} 