<script setup lang="ts">
import Map from '@/components/Map.vue'
import SideView from '@/components/SideView.vue'
import { useDatasetStore } from '@/stores/useDatasetStore'
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

const store = useDatasetStore()
const { isLoading } = storeToRefs(store)

onMounted(async () => {
  await store.initializeStore()
})
</script>

<template>
  <div class="flex h-screen">
    <div v-if="isLoading" class="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>

    <!-- Map Section -->
    <div class="flex-grow">
      <Map />
    </div>

    <!-- Sidebar -->
    <SideView />
  </div>
</template>
