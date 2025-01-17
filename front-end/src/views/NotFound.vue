<script setup lang="ts">
import { Button } from "@/components/ui/button";
</script>

<template>
  <div class="text-center">
    <h1 class="text-4xl font-bold mb-4">404 - Page Not Found</h1>
    <p class="mb-4">The page you are looking for does not exist.</p>
    <Button><router-link to="/">Go To Home</router-link></Button>
  </div>
</template>
