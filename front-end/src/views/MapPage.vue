<script setup lang="ts">
import { ref } from 'vue'
import Map from '@/components/Map.vue'
import FileUpload from '@/components/FileUpload.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UploadCloud, Map as MapIcon } from 'lucide-vue-next'

const uploadedFiles = ref<File[]>([])

const handleFileUpload = (files: File[]) => {
  console.log('Files to process:', files)
  uploadedFiles.value = files
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

    <Card>
      <CardHeader>
        <CardTitle class="flex items-center space-x-2">
          <MapIcon class="h-6 w-6" />
          <span>Geospatial Map</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Map :uploadedFiles="uploadedFiles" />
      </CardContent>
    </Card>
  </div>
</template>