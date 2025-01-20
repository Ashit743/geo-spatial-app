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
    if (!Array.isArray(newDatasets)) {
      console.error("addDatasets expects an array of datasets:", newDatasets);
      return;
    }
  
    // Filter out datasets with duplicate IDs
    const uniqueDatasets = newDatasets.filter(
      (newDataset) => !datasets.value.some((existingDataset) => existingDataset.id === newDataset.id)
    );
  
    if (uniqueDatasets.length > 0) {
      datasets.value = [...datasets.value, ...uniqueDatasets];
      console.log("Adding unique datasets to store:", uniqueDatasets);
    } else {
      console.log("No unique datasets to add.");
    }
  };


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

  const removeDataset = (datasetId: string) => {
    const index = datasets.value.findIndex(d => d.id === datasetId);
    if (index !== -1) {
      datasets.value.splice(index, 1);
      
      // Also remove from localStorage if needed
      const savedShapes = JSON.parse(localStorage.getItem('savedShapes') || '[]');
      const updatedShapes = savedShapes.filter((shape: any) => shape.id !== datasetId);
      localStorage.setItem('savedShapes', JSON.stringify(updatedShapes));
    }
  }

  const deleteDataset = (id: string) => {
    datasets.value = datasets.value.filter(dataset => dataset.id !== id)
  }

  const clearAllDatasets = () => {
    datasets.value = []
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
    updateSelectedDatasetsGeoJSON,
    removeDataset,
    deleteDataset,
    clearAllDatasets
  }
})