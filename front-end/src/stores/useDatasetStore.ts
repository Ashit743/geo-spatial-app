import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Dataset {
  id: string;
  name: string;
  file: File;
  visible: boolean;
  layerId: string;
  geojson: any;
}

export const useDatasetStore = defineStore('dataset', () => {
  const datasets = ref<Dataset[]>([])
  const defaultGeoJSON = ref({
    type: "FeatureCollection",
    features: []
  })

  const addDatasets = (newDatasets: Dataset[]) => {
    datasets.value = [...datasets.value, ...newDatasets]
  }

  const toggleDatasetVisibility = (datasetId: string) => {
    const dataset = datasets.value.find(d => d.id === datasetId)
    if (dataset) {
      dataset.visible = !dataset.visible
    }
  }

  const updateDatasetGeoJSON = (datasetId: string, newGeoJSON: any) => {
    const dataset = datasets.value.find(d => d.id === datasetId)
    if (dataset) {
      dataset.geojson = newGeoJSON
    }
  }

  const visibleDatasets = computed(() => datasets.value.filter(d => d.visible))

  const activeDataset = ref<Dataset | null>(null)

  const setActiveDataset = (datasetId: string | null) => {
    activeDataset.value = datasetId ? datasets.value.find(d => d.id === datasetId) || null : null
  }

  return {
    datasets,
    defaultGeoJSON,
    addDatasets,
    toggleDatasetVisibility,
    updateDatasetGeoJSON,
    visibleDatasets,
    activeDataset,
    setActiveDataset
  }
})

