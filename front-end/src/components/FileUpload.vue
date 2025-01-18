<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UploadCloud } from 'lucide-vue-next'

const emit = defineEmits<{
  (event: 'uploadFiles', files: File[]): void
}>()

const uploadedFiles = ref<File[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)

const resetFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    uploadedFiles.value = [...uploadedFiles.value, ...Array.from(input.files)]
  }
  resetFileInput()
}

const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1)
  if (uploadedFiles.value.length === 0) {
    resetFileInput()
  }
}

const submitFiles = () => {
  if (uploadedFiles.value.length > 0) {
    emit('uploadFiles', uploadedFiles.value)
    uploadedFiles.value = []
    resetFileInput()
  }
}

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.inputRef.click()
  }
}
</script>

<template>
  <div class="file-upload space-y-4">
    <div class="flex items-center space-x-4">
      <Input
        ref="fileInputRef"
        type="file"
        accept=".geojson,.kml,.tiff"
        multiple
        @change="handleFileChange"
        class="hidden"
      />
      <Button @click="triggerFileInput" variant="outline">
        <UploadCloud class="mr-2 h-4 w-4" />
        Choose Files
      </Button>
      <span class="text-sm text-muted-foreground">
        {{ uploadedFiles.length }} file(s) selected
      </span>
    </div>
    <ul v-if="uploadedFiles.length > 0" class="space-y-2">
      <li
        v-for="(file, index) in uploadedFiles"
        :key="index"
        class="flex justify-between items-center p-2 bg-secondary rounded"
      >
        <span class="text-sm truncate mr-2">{{ file.name }}</span>
        <Button @click="removeFile(index)" variant="ghost" size="sm">
          Remove
        </Button>
      </li>
    </ul>
    <Button @click="submitFiles" :disabled="uploadedFiles.length === 0">
      Upload Files
    </Button>
  </div>
</template>

