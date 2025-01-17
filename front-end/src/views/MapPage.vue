<script setup lang="ts">
import Map from '@/components/Map.vue'
import { Button } from '@/components/ui/button'
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-4xl font-bold">Map Page</h1>
      <Button><router-link to="/">Go To Home</router-link></Button>
    </div>
    <Map />
  </div>
</template>