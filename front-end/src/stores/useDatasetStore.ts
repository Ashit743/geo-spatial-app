import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Dataset {
  id: string;
  name: string;
  file: File;
  visible: boolean;
  layerId: string;
  geojson: any;
  selected: boolean;
}

export const useDatasetStore = defineStore('Dataset', () => {
  const datasets = ref<Dataset[]>([])
  const defaultGeoJSON = ref({
    type: "FeatureCollection",
    features: []
  })

  const addDatasets = (newDatasets: Dataset[]) => {
    datasets.value = [...datasets.value, ...newDatasets]
  }

  const updateVisibilityAndSelection = (datasetId: string, isVisible: boolean) => {
    const dataset = datasets.value.find(d => d.id === datasetId);
    if (dataset) {
      dataset.visible = isVisible;
      dataset.selected = isVisible; // Automatically select if visible
    }
  };
  

  const toggleDatasetVisibility = (datasetId: string) => {
    const dataset = datasets.value.find(d => d.id === datasetId)
    if (dataset) {
      dataset.visible = !dataset.visible
      dataset.visible === true ?dataset.selected = true: dataset.selected = false
    }

  }

  const updateDatasetGeoJSON = (datasetId: string, newGeoJSON: any) => {
    const dataset = datasets.value.find(d => d.id === datasetId)
    if (dataset) {
      dataset.geojson = newGeoJSON
    }
  }

  const visibleDatasets = computed(() => datasets.value.filter(d => d.visible))

  const selectedDatasets = computed(() => datasets.value.filter(d => d.selected))

  const toggleDatasetSelection = (datasetId: string) => {
    const dataset = datasets.value.find(d => d.id === datasetId)
    debugger;
    if (dataset) {
      dataset.selected = !dataset.selected
    }
  }

  const updateSelectedDatasetsGeoJSON = (newGeoJSON: any) => {
    const features = newGeoJSON.features
    let featureIndex = 0
    for (const dataset of selectedDatasets.value) {
      const datasetFeatureCount = dataset.geojson?.features?.length || 0
      dataset.geojson = {
        type: "FeatureCollection",
        features: features.slice(featureIndex, featureIndex + datasetFeatureCount)
      }
      featureIndex += datasetFeatureCount
    }
  }

  return {
    datasets,
    defaultGeoJSON,
    addDatasets,
    toggleDatasetVisibility,
    updateDatasetGeoJSON,
    updateVisibilityAndSelection,
    visibleDatasets,
    selectedDatasets,
    toggleDatasetSelection,
    updateSelectedDatasetsGeoJSON
  }
})