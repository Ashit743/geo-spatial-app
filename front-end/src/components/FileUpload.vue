<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UploadCloud } from 'lucide-vue-next'

const emit = defineEmits<{
  (event: 'uploadFiles', files: File[]): void
}>()

const uploadedFiles = ref<File[]>([])
// Ref to your custom input component
const fileInputRef = ref<InstanceType<typeof Input> | null>(null)

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    uploadedFiles.value = Array.from(input.files)
  }
}

const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1)
}

const submitFiles = () => {
  if (uploadedFiles.value.length > 0) {
    emit('uploadFiles', uploadedFiles.value)
    uploadedFiles.value = [] // Clear the files after submitting
    if (fileInputRef.value) {
      // Clear the file input when files are submitted
      fileInputRef.value.modelValue = '' // Clear the modelValue bound to the input
    }
  }
}

const triggerFileInput = () => {
  if (fileInputRef.value && fileInputRef.value.inputRef) {
    // Trigger the file input dialog from the custom component's input element
    fileInputRef.value.inputRef.click()
  }
}
</script>

<template>
  <div class="file-upload space-y-4">
    <div class="flex items-center space-x-4">
      <!-- Custom Input Component for File Selection -->
      <Input
        ref="fileInputRef"
        type="file"
        accept=".geojson,.kml,.tiff"
        multiple
        @change="handleFileChange"
        class="hidden"
      />
      <!-- Button to Trigger File Input Click -->
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
        <span class="text-sm">{{ file.name }}</span>
        <Button
          variant="ghost"
          size="sm"
          @click="removeFile(index)"
          class="text-destructive hover:text-destructive-foreground hover:bg-destructive"
        >
          Remove
        </Button>
      </li>
    </ul>
    <Button
      @click="submitFiles"
      :disabled="uploadedFiles.length === 0"
      :class="{ 'opacity-50 cursor-not-allowed': uploadedFiles.length === 0 }"
    >
      Upload Files
    </Button>
  </div>
</template>
