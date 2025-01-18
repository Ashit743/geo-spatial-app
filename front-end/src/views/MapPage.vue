<script setup lang="ts">
import Map from '@/components/Map.vue'
import SideView from '@/components/SideView.vue'
</script>

<template>
  <div class="flex h-screen">
    <!-- Map Section -->
    <div class="flex-grow">
      <Map />
    </div>

    <!-- Sidebar -->
    <SideView />
  </div>
</template>

