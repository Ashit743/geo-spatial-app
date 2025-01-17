<script setup lang="ts">
import { ToastProvider } from 'radix-vue'
import { useToast } from './use-toast'

const { toasts } = useToast()
</script>

<template>
  <ToastProvider>
    <slot />
    <div
      class="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full"
          :class="[
            toast.class,
            'bg-background text-foreground',
            'border',
            'dark:bg-background dark:text-foreground dark:border-border',
          ]"
        >
          <div class="grid gap-1">
            <div class="text-sm font-semibold">
              {{ toast.title }}
            </div>
            <div class="text-sm opacity-90">
              {{ toast.description }}
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </ToastProvider>
</template>
