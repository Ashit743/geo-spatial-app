<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { MapPin, Upload, Layers } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col">
    <header class="py-6 px-4 sm:px-6 lg:px-8 border-b">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-foreground">Geospatial App</h1>
      </div>
    </header>
    
    <main class="flex-grow container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center space-x-2">
              <MapPin class="h-6 w-6" />
              <span>Interactive Map</span>
            </CardTitle>
            <CardDescription>Explore geospatial data visually</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Our interactive map allows you to visualize and analyze geospatial data with ease.</p>
          </CardContent>
          <CardFooter>
            <Button><router-link to="/map">Open Map</router-link></Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center space-x-2">
              <Upload class="h-6 w-6" />
              <span>File Upload</span>
            </CardTitle>
            <CardDescription>Import your geospatial data</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Upload your GeoJSON files to visualize and analyze your custom datasets.</p>
          </CardContent>
          <CardFooter>
            <Button><router-link to="/map">Upload Files</router-link></Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center space-x-2">
              <Layers class="h-6 w-6" />
              <span>Data Management</span>
            </CardTitle>
            <CardDescription>Manage your datasets</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Easily manage, toggle visibility, and edit your uploaded geospatial datasets.</p>
          </CardContent>
          <CardFooter>
            <Button><router-link to="/map">Manage Data</router-link></Button>
          </CardFooter>
        </Card>
      </div>
    </main>

    <footer class="py-6 px-4 sm:px-6 lg:px-8 border-t">
      <div class="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
        © 2023 Geospatial App. All rights reserved.
      </div>
    </footer>
  </div>
</template>

