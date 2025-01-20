<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDatasetStore } from '@/stores/useDatasetStore'
import FileUpload from '@/components/FileUpload.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UploadCloud, Map as MapIcon, Eye, EyeOff, Code, ChevronRight, ChevronLeft, Trash2 } from 'lucide-vue-next'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { vResizable } from '@/directives/resizable'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createDataset } from '@/services/api'

const store = useDatasetStore()
const isCollapsed = ref(false)
const sidebarWidth = ref(320) // Initial width
const isDialogOpen = ref(false)

const handleFileUpload = (files: File[]) => {
  const newDatasets = files.map((file, index) => ({
    id: `dataset-${Date.now()}-${index}`,
    name: file.name,
    file,
    visible: true,
    layerId: `layer-${Date.now()}-${index}`,
    geojson: null,
    selected: true
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

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleDeleteDataset = (id: string) => {
  store.deleteDataset(id)
}

const handleClearAll = () => {
  store.clearAllDatasets()
  isDialogOpen.value = false
}

const closeDialog = () => {
  isDialogOpen.value = false
}

const handleSaveDatasets = async () => {
  try {
    for (const dataset of store.datasets) {
      // Transform the dataset to match backend expectations
      const datasetToSave = {
        name: dataset.name,
        file: dataset.file.name, // Convert File object to string (filename)
        visible: dataset.visible,
        layerId: dataset.layerId,
        geojson: dataset.geojson,
        selected: dataset.selected
      };
      
      // Log the transformed data for debugging
      console.log('Saving dataset:', datasetToSave);
      
      const savedDataset = await createDataset(datasetToSave);
      console.log('Successfully saved dataset:', savedDataset);
    }
    // Show success message
    // You might want to add a toast notification here
  } catch (error) {
    console.error('Error saving datasets:', error);
    // Show error message
    // You might want to add a toast notification here
  }
}
</script>

<template>
  <div 
    v-resizable
    class="bg-background border-l border-border overflow-hidden h-full transition-all duration-300 ease-in-out relative"
    :class="{ 'w-12': isCollapsed, 'w-80': !isCollapsed }"
    :style="{ width: isCollapsed ? '48px' : `${sidebarWidth}px` }"
  >
    <Button
      @click="toggleSidebar"
      class="absolute top-2 -left-3 z-10"
      variant="outline"
      size="icon"
    >
      <ChevronLeft v-if="!isCollapsed" class="h-4 w-4" />
      <ChevronRight v-else class="h-4 w-4" />
    </Button>

    <div v-show="!isCollapsed" class="h-full">
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
              <CardTitle class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <MapIcon class="h-5 w-5" />
                  <span>Datasets</span>
                </div>
                <div class="flex gap-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    class="gap-2"
                    @click="handleSaveDatasets"
                    v-if="store.datasets.length > 0"
                  >
                    Save All
                  </Button>
                  <Dialog v-model:open="isDialogOpen">
                    <DialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        class="gap-2"
                        v-if="store.datasets.length > 0"
                      >
                        <Trash2 class="h-4 w-4" />
                        Clear All
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Clear All Datasets</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to remove all datasets? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" @click="closeDialog">Cancel</Button>
                        <Button variant="destructive" @click="handleClearAll">Clear All</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul class="space-y-2" v-if="store.datasets.length > 0">
                <li v-for="dataset in store.datasets" :key="dataset.id" 
                    class="flex items-center justify-between group">
                  <span class="text-sm truncate flex-grow mr-2">{{ dataset.name }}</span>
                  <div class="flex items-center space-x-2">
                    <Switch
                      :checked="dataset.visible"
                      @update:checked="(checked) => store.updateVisibilityAndSelection(dataset.id, checked)"
                    >
                      <Eye v-if="dataset.visible" class="h-4 w-4" />
                      <EyeOff v-else class="h-4 w-4" />
                    </Switch>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      class="h-8 w-8 transition-colors text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                      @click="handleDeleteDataset(dataset.id)"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
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
                <span>JSON View</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div v-if="store.selectedDatasets.length > 0">
                <Textarea
                  v-model="jsonContent"
                  :placeholder="activeDatasetJson"
                  rows="20"
                  class="font-mono text-sm h-[calc(100vh-300px)]"
                  readonly
                />
              </div>
              <p v-else class="text-sm text-muted-foreground">Select a dataset to view its JSON.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>

<style scoped>
.group:hover {
  background-color: var(--accent);
}

.group:hover .opacity-0 {
  opacity: 1;
}
</style>

