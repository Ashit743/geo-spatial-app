<script setup lang="ts">
import { ref } from 'vue'
import Map from '@/components/Map.vue'
import FileUpload from '@/components/FileUpload.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UploadCloud, Map as MapIcon, Eye, EyeOff } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

interface Dataset {
  id: string;
  name: string;
  file: File;
  visible: boolean;
  layerId: string;
}

const datasets = ref<Dataset[]>([])

const handleFileUpload = (files: File[]) => {
  const newDatasets = files.map((file, index) => ({
    id: `dataset-${Date.now()}-${index}`,
    name: file.name,
    file,
    visible: true,
    layerId: `layer-${Date.now()}-${index}`
  }))
  datasets.value = [...datasets.value, ...newDatasets]
}

const toggleDatasetVisibility = (datasetId: string) => {
  const dataset = datasets.value.find(d => d.id === datasetId)
  if (dataset) {
    dataset.visible = !dataset.visible
  }
}
</script>

<template>
  <div class="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center space-x-2">
          <UploadCloud class="h-6 w-6" />
          <span>Upload Geospatial Files</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FileUpload @uploadFiles="handleFileUpload" />
      </CardContent>
    </Card>

    <Card v-if="datasets.length > 0">
      <CardHeader>
        <CardTitle class="flex items-center space-x-2">
          <MapIcon class="h-6 w-6" />
          <span>Uploaded Datasets</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul class="space-y-2">
          <li v-for="dataset in datasets" :key="dataset.id" class="flex items-center justify-between">
            <span>{{ dataset.name }}</span>
            <Switch
              :checked="dataset.visible"
              @update:checked="toggleDatasetVisibility(dataset.id)"
            >
              <Eye v-if="dataset.visible" class="h-4 w-4" />
              <EyeOff v-else class="h-4 w-4" />
            </Switch>
          </li>
        </ul>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="flex items-center space-x-2">
          <MapIcon class="h-6 w-6" />
          <span>Geospatial Map</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Map :datasets="datasets" />
      </CardContent>
    </Card>
  </div>
</template>

