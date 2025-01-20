<script setup lang="ts">
import { useDatasetStore } from '@/stores/useDatasetStore'
import { Button } from '@/components/ui/button'
import { Trash2, XCircle } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const store = useDatasetStore()

const handleClearAll = () => {
  store.clearAllDatasets()
}
</script>

<template>
  <div class="absolute top-4 right-4 flex gap-2">
    <!-- Clear All Dialog -->
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" class="gap-2">
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
          <Button variant="outline" @click="$emit('close')">Cancel</Button>
          <Button variant="destructive" @click="handleClearAll">Clear All</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template> 