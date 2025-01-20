<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { Button } from '@/components/ui/button'
import { Sun, Moon, LogOut } from 'lucide-vue-next'
import ToastProvider from '@/components/ui/toast/ToastProvider.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const { isDark, toggleDark } = useTheme()
const router = useRouter()
const authStore = useAuthStore()
const isDialogOpen = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)

const getInitials = () => {
  const token = authStore.token
  if (!token) return 'A'
  return token.charAt(0).toUpperCase()
}

provide('isDark', isDark)

const handleLogout = async () => {
  localStorage.removeItem('token')
  authStore.reset()
  isDialogOpen.value = false
  await router.push('/login')
}

const openLogoutDialog = () => {
  isDialogOpen.value = true
}

const closeLogoutDialog = () => {
  isDialogOpen.value = false
}
</script>

<template>
  <ToastProvider>
    <div :class="{ 'dark': isDark }">
      <div class="min-h-screen bg-background text-foreground">
        <header v-if="isAuthenticated" class="border-b">
          <div class="container mx-auto px-4 py-4 flex justify-between items-center">
            <div class="flex items-center space-x-4">
              <Avatar class="h-10 w-10 bg-primary text-primary-foreground">
                <AvatarImage src="https://github.com/radix-vue.png" alt="@radix-vue" />
                <AvatarFallback>{{ getInitials() }}</AvatarFallback>
              </Avatar>
              <nav class="space-x-4">
                <router-link to="/" class="text-foreground hover:text-primary transition-colors">Home</router-link>
                <router-link to="/map" class="text-foreground hover:text-primary transition-colors">Map</router-link>
              </nav>
            </div>
            <div class="flex items-center space-x-2">
              <Button variant="outline" size="icon" @click="toggleDark">
                <Sun v-if="!isDark" class="h-[1.2rem] w-[1.2rem]" />
                <Moon v-else class="h-[1.2rem] w-[1.2rem]" />
                <span class="sr-only">Toggle theme</span>
              </Button>
              
              <Dialog :open="isDialogOpen" @update:open="isDialogOpen = $event">
                <DialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    class="hover:bg-destructive/90"
                    @click="openLogoutDialog"
                  >
                    <LogOut class="h-[1.2rem] w-[1.2rem]" />
                    <span class="sr-only">Logout</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Logout</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to logout? You will need to login again to access your account.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter class="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      @click="closeLogoutDialog"
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      @click="handleLogout"
                    >
                      Logout
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
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

