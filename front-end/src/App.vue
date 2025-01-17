<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { Button } from '@/components/ui/button'
import { Sun, Moon } from 'lucide-vue-next'
import ToastProvider from '@/components/ui/toast/ToastProvider.vue'

const { isDark, toggleDark } = useTheme()
const route = useRoute()

</script>

<template>
  <ToastProvider>
    <div :class="{ 'dark': isDark }">
      <div class="min-h-screen bg-background text-foreground">
        <header  class="border-b">
          <div class="container mx-auto px-4 py-4 flex justify-between items-center">
            <nav class="space-x-4">
              <router-link to="/" class="text-foreground hover:text-primary transition-colors">Home</router-link>
              <router-link to="/map" class="text-foreground hover:text-primary transition-colors">Map</router-link>
            </nav>
            <Button variant="outline" size="icon" @click="toggleDark">
              <Sun v-if="!isDark" class="h-[1.2rem] w-[1.2rem]" />
              <Moon v-else class="h-[1.2rem] w-[1.2rem]" />
              <span class="sr-only">Toggle theme</span>
            </Button>
          </div>
        </header>
        <main class="container mx-auto px-4 py-8">
          <router-view></router-view>
        </main>
      </div>
    </div>
  </ToastProvider>
</template>

<style>
@import './style.css';
</style>

