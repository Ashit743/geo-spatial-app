import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createDataset, fetchDatasets } from '../services/api'
import { useToast } from '@/components/ui/toast/use-toast'

export interface Dataset {
  id: string;
  name: string;
  file: File;
  visible: boolean;
  layerId: string;
  geojson: any;
  selected: boolean;
  isSaved?: boolean;
}

export const useDatasetStore = defineStore('Dataset', () => {
  const { toast } = useToast()
  const datasets = ref<Dataset[]>([])
  const isLoading = ref(false)
  const hasUnsavedChanges = ref(false)
  const defaultGeoJSON = ref({
    type: "FeatureCollection",
    features: []
  })

  const initializeStore = async () => {
    isLoading.value = true;
    try {
      // Try to fetch from backend first
      console.log('Fetching datasets from backend...');
      const backendDatasets = await fetchDatasets();
      console.log('Received datasets:', backendDatasets);

      // Check if we have valid data
      if (backendDatasets && Array.isArray(backendDatasets) && backendDatasets.length > 0) {
        datasets.value = backendDatasets.map(dataset => ({
          ...dataset,
          isSaved: true,
          // Ensure all required properties are present
          id: dataset.id || `dataset-${Date.now()}`,
          name: dataset.name,
          file: dataset.file,
          visible: dataset.visible ?? true,
          layerId: dataset.layerId || `layer-${dataset.id || Date.now()}`,
          geojson: dataset.geojson,
          selected: dataset.selected ?? false
        }));

        console.log('Processed datasets:', datasets.value);
        toast({
          title: "Success",
          description: `Loaded ${backendDatasets.length} datasets from server`,
        });
        return true;
      } else {
        console.log('No datasets found in backend response');
        throw new Error('No datasets found');
      }
    } catch (error) {
      console.error('Failed to fetch from server:', error);
      toast({
        title: "Error",
        description: "Failed to fetch datasets from server. Checking local storage...",
        variant: "destructive"
      });

      // Try local storage as fallback
      try {
        const localData = localStorage.getItem('savedShapes');
        console.log('Local storage data:', localData);

        if (localData) {
          const parsedData = JSON.parse(localData);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            datasets.value = parsedData.map(dataset => ({
              ...dataset,
              isSaved: false
            }));
            console.log('Loaded from localStorage:', datasets.value);
            toast({
              title: "Info",
              description: "Loaded datasets from local storage",
            });
            return true;
          }
        }
        console.log('No valid data in localStorage');
      } catch (localError) {
        console.error('Failed to load from localStorage:', localError);
      }
    } finally {
      isLoading.value = false;
    }

    // If we get here, no data was found
    console.log('No data found in either backend or localStorage');
    toast({
      title: "Welcome",
      description: "No existing datasets found. Start by creating a shape or uploading a file.",
    });
    return false;
  };

  const addDatasets = (newDatasets: Dataset[]) => {
    if (!Array.isArray(newDatasets)) {
      console.error("addDatasets expects an array of datasets:", newDatasets);
      return;
    }

    // Check if these are drawn shapes (they have a specific ID format)
    const isDrawnShape = newDatasets.some(dataset => dataset.id.startsWith('Shape-'));

    if (isDrawnShape) {
      // For drawn shapes, update existing or add new
      newDatasets.forEach(newDataset => {
        const existingIndex = datasets.value.findIndex(d => d.id === newDataset.id);
        if (existingIndex !== -1) {
          // Update existing dataset
          datasets.value[existingIndex] = { ...newDataset, isSaved: false };
        } else {
          // Add new dataset
          datasets.value.push({ ...newDataset, isSaved: false });
        }
      });
    } else {
      // For uploaded datasets, maintain unique dataset logic
      const uniqueDatasets = newDatasets
        .map(dataset => ({
          ...dataset,
          isSaved: false
        }))
        .filter(newDataset =>
          !datasets.value.some(existingDataset => existingDataset.id === newDataset.id)
        );

      if (uniqueDatasets.length > 0) {
        datasets.value = [...datasets.value, ...uniqueDatasets];
        console.log("Adding unique datasets to store:", uniqueDatasets);
      } else {
        console.log("No unique datasets to add.");
      }
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
      dataset.visible === true ? dataset.selected = true : dataset.selected = false
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
      hasUnsavedChanges.value = true;

      // Update localStorage
      const savedShapes = JSON.parse(localStorage.getItem('savedShapes') || '[]');
      const updatedShapes = savedShapes.filter((shape: any) => shape.id !== datasetId);
      localStorage.setItem('savedShapes', JSON.stringify(updatedShapes));
    }
  }

  const deleteDataset = (id: string) => {
    const index = datasets.value.findIndex(dataset => dataset.id === id);
    if (index !== -1) {
      datasets.value.splice(index, 1);
      // Mark that we have unsaved changes
      hasUnsavedChanges.value = true;
      // Reset isSaved flag for remaining datasets
      datasets.value.forEach(dataset => {
        dataset.isSaved = false;
      });
    }
  }

  const clearAllDatasets = () => {
    datasets.value = [];
    hasUnsavedChanges.value = true;
  }

  return {
    datasets,
    isLoading,
    hasUnsavedChanges,
    defaultGeoJSON,
    initializeStore,
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
    clearAllDatasets,
  }
})