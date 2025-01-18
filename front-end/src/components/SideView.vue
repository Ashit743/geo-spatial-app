<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDatasetStore } from '@/stores/useDatasetStore'
import FileUpload from '@/components/FileUpload.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UploadCloud, Map as MapIcon, Eye, EyeOff, Code } from 'lucide-vue-next'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const store = useDatasetStore()

const handleFileUpload = (files: File[]) => {
  const newDatasets = files.map((file, index) => ({
    id: `dataset-${Date.now()}-${index}`,
    name: file.name,
    file,
    visible: true,
    layerId: `layer-${Date.now()}-${index}`,
    geojson: null,
    selected: false
  }))
  store.addDatasets(newDatasets)
}

const jsonContent = ref('')

const activeDatasetJson = computed(() => {
  if (store.selectedDatasets.length > 0) {
    const combinedFeatures = store.selectedDatasets.flatMap(dataset => 
      dataset.geojson?.features || []
    )
    return JSON.stringify({
      type: "FeatureCollection",
      features: combinedFeatures
    }, null, 2)
  }
  return ''
})

watch(activeDatasetJson, (newValue) => {
  jsonContent.value = newValue
})

const updateJson = () => {
  if (store.selectedDatasets.length > 0) {
    try {
      const newGeoJSON = JSON.parse(jsonContent.value)
      store.updateSelectedDatasetsGeoJSON(newGeoJSON)
    } catch (error) {
      console.error('Invalid JSON:', error)
      // You might want to show an error message to the user here
    }
  }
}
</script>

<template>
  <div class="w-80 bg-background border-l border-border overflow-y-auto h-full">
    <Tabs defaultValue="upload" class="w-full">
      <TabsList class="grid w-full grid-cols-3">
        <TabsTrigger value="upload">Upload</TabsTrigger>
        <TabsTrigger value="datasets">Datasets</TabsTrigger>
        <TabsTrigger value="json">JSON</TabsTrigger>
      </TabsList>
      <TabsContent value="upload">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center space-x-2">
              <UploadCloud class="h-5 w-5" />
              <span>Upload Files</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload @uploadFiles="handleFileUpload" />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="datasets">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center space-x-2">
              <MapIcon class="h-5 w-5" />
              <span>Datasets</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul class="space-y-2" v-if="store.datasets.length > 0">
              <li v-for="dataset in store.datasets" :key="dataset.id" class="flex items-center justify-between">
                <span class="text-sm truncate flex-grow mr-2">{{ dataset.name }}</span>
                <div class="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="store.toggleDatasetSelection(dataset.id)"
                    :class="{ 'bg-primary/20': dataset.selected }"
                  >
                    <Code class="h-4 w-4" />
                  </Button>
                  <Switch
                    :checked="dataset.visible"
                    @update:checked="store.toggleDatasetVisibility(dataset.id)"
                  >
                    <Eye v-if="dataset.visible" class="h-4 w-4" />
                    <EyeOff v-else class="h-4 w-4" />
                  </Switch>
                </div>
              </li>
            </ul>
            <p v-else class="text-sm text-muted-foreground">No datasets uploaded yet.</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="json">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center space-x-2">
              <Code class="h-5 w-5" />
              <span>JSON Editor</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="store.selectedDatasets.length > 0">
              <Textarea
                v-model="jsonContent"
                :placeholder="activeDatasetJson"
                rows="10"
                class="font-mono text-sm"
              />
              <Button @click="updateJson" class="mt-2">Update JSON</Button>
            </div>
            <p v-else class="text-sm text-muted-foreground">Select a dataset to edit its JSON.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>