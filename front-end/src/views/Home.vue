<script setup>
import { inject } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { MapPin } from 'lucide-vue-next'
import EarthVisualization from '@/components/EarthVisualization.vue'

// Inject isDark from parent component
const isDark = inject('isDark')
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden">
    <div class="absolute inset-0 flex items-center justify-center">
      <EarthVisualization :isDarkMode="isDark" class="w-full h-full" />
    </div>

    <div class="absolute inset-0 flex flex-col">
      <header class="py-6 px-4 sm:px-6 lg:px-8 z-10">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <h1 class="text-3xl font-bold" :class="isDark ? 'text-white' : 'text-black'">Geospatial Explorer</h1>
        </div>
      </header>

      <main class="flex-grow container mx-auto py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center z-10">
        <Card class="w-full max-w-md" :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'">
          <CardHeader>
            <CardTitle class="flex items-center space-x-2" :class="isDark ? 'text-white' : 'text-black'">
              <MapPin class="h-6 w-6" />
              <span>Interactive Global Map</span>
            </CardTitle>
            <CardDescription :class="isDark ? 'text-gray-300' : 'text-gray-700'">
              Explore our world in stunning detail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p :class="isDark ? 'text-gray-200' : 'text-gray-800'">
              Dive into our interactive map and discover the beauty of geospatial data.
            </p>
          </CardContent>
          <CardFooter>
            <Button class="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <router-link to="/map" class="w-full h-full flex items-center justify-center">
                Explore the Map
              </router-link>
            </Button>
          </CardFooter>
        </Card>
      </main>

      <footer class="py-6 px-4 sm:px-6 lg:px-8 z-10">
        <div :class="isDark ? 'text-gray-300' : 'text-gray-600'" class="max-w-7xl mx-auto text-center text-sm">
          © 2025 Geospatial Explorer. All rights reserved.
        </div>
      </footer>
    </div>
  </div>
</template>

