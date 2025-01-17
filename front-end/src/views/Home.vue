<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <div>
    <h1 class="text-4xl font-bold mb-4">Welcome to Geospatial App</h1>
    <p class="mb-4">This is the homepage. Navigate to the map for geospatial features.</p>
    <Button><router-link to="/map">Go To Map</router-link>
    </Button>
  </div>
</template>