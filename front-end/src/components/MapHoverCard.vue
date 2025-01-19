<script setup lang="ts">
import { Card, CardContent } from "@/components/ui/card"
import { computed } from 'vue'

const props = defineProps<{
  feature: {
    id: string;
    properties?: Record<string, any>;
    geometry?: {
      type: string;
      coordinates: any;
    };
    layer?: {
      id: string;
    };
    source?: string;
  }
}>();

const getFeatureName = computed(() => {
  return props.feature.properties?.name || `Shape ${props.feature.id}`;
});

const getGeometryInfo = computed(() => {
  const type = props.feature.geometry?.type;
  switch (type?.toLowerCase()) {
    case 'polygon':
      return {
        type: 'Polygon',
        vertices: props.feature.geometry?.coordinates[0]?.length || 0,
        area: calculateArea(props.feature.geometry?.coordinates),
      };
    case 'linestring':
      return {
        type: 'Line',
        vertices: props.feature.geometry?.coordinates?.length || 0,
        length: calculateLength(props.feature.geometry?.coordinates),
      };
    case 'point':
      return {
        type: 'Point',
        coordinates: formatCoordinates(props.feature.geometry?.coordinates),
      };
    default:
      return { type: type || 'Unknown' };
  }
});

const calculateArea = (coordinates: any[]): string => {
  if (!coordinates || !coordinates[0]) return 'N/A';
  // Simple approximation - for demo purposes
  const area = Math.abs(coordinates[0].reduce((acc: number, curr: number[], i: number, arr: number[][]) => {
    const next = arr[(i + 1) % arr.length];
    return acc + (curr[0] * next[1] - next[0] * curr[1]);
  }, 0) / 2);
  return area.toFixed(2) + ' km²';
};

const calculateLength = (coordinates: any[]): string => {
  if (!coordinates) return 'N/A';
  // Simple approximation
  let length = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const curr = coordinates[i];
    const next = coordinates[i + 1];
    length += Math.sqrt(
      Math.pow(next[0] - curr[0], 2) + Math.pow(next[1] - curr[1], 2)
    );
  }
  return (length * 111).toFixed(2) + ' km'; // Rough conversion to km
};

const formatCoordinates = (coordinates: any): string => {
  if (!coordinates || !Array.isArray(coordinates)) return 'N/A';
  
  try {
    if (Array.isArray(coordinates[0])) {
      return formatCoordinates(coordinates[0]);
    }
    
    if (coordinates.length >= 2) {
      return `${coordinates[0].toFixed(4)}°, ${coordinates[1].toFixed(4)}°`;
    }
  } catch (error) {
    console.error('Error formatting coordinates:', error);
  }
  
  return 'N/A';
};

const getTimestamp = () => {
  return new Date().toLocaleString();
};
</script>

<template>
  <Card class="w-72 shadow-lg bg-white/95 backdrop-blur-sm" v-if="feature">
    <CardContent class="p-3">
      <div class="space-y-2">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="text-sm font-semibold">
            {{ getFeatureName }}
          </h4>
          <div 
            v-if="feature.properties?.color" 
            class="w-4 h-4 rounded"
            :style="{ backgroundColor: feature.properties.color }"
          />
        </div>
        
        <div class="text-xs space-y-2">
          <!-- Geometry Info -->
          <div class="bg-muted/50 p-2 rounded">
            <p class="font-medium text-primary mb-1">Geometry Details</p>
            <p><span class="font-medium">Type:</span> {{ getGeometryInfo.type }}</p>
            <template v-if="getGeometryInfo.vertices">
              <p><span class="font-medium">Vertices:</span> {{ getGeometryInfo.vertices }}</p>
            </template>
            <template v-if="getGeometryInfo.area">
              <p><span class="font-medium">Area:</span> {{ getGeometryInfo.area }}</p>
            </template>
            <template v-if="getGeometryInfo.length">
              <p><span class="font-medium">Length:</span> {{ getGeometryInfo.length }}</p>
            </template>
          </div>

          <!-- Location Info -->
          <div class="bg-muted/50 p-2 rounded">
            <p class="font-medium text-primary mb-1">Location</p>
            <p><span class="font-medium">Coordinates:</span><br/>
              {{ formatCoordinates(feature.geometry?.coordinates) }}</p>
          </div>

          <!-- Additional Properties -->
          <div v-if="feature.properties && Object.keys(feature.properties).length > 0"
               class="bg-muted/50 p-2 rounded">
            <p class="font-medium text-primary mb-1">Properties</p>
            <template v-for="(value, key) in feature.properties" :key="key">
              <p v-if="!['name', 'color'].includes(key)" class="capitalize">
                <span class="font-medium">{{ key.replace(/_/g, ' ') }}:</span> 
                {{ typeof value === 'number' ? value.toFixed(2) : value }}
              </p>
            </template>
          </div>

          <!-- Metadata -->
          <div class="text-muted-foreground text-[10px] pt-1">
            <p>Layer: {{ feature.layer?.id }}</p>
            <p>Last Updated: {{ getTimestamp() }}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<style scoped>
.card {
  pointer-events: none;
  user-select: none;
}
</style>