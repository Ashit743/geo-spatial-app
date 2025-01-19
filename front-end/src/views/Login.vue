<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast/use-toast'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const { toast } = useToast()
const authStore = useAuthStore()

const email = ref<string>('')
const password = ref<string>('')

const handleLogin = async () => {
  try {
    await authStore.login(email.value, password.value)
    toast({
      title: 'Success',
      description: 'Login successful!',
    })
    router.push('/map')
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Invalid credentials!',
      variant: 'destructive',
    })
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <Card class="w-[350px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div class="space-y-2">
            <label for="password" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
            <Input
              id="password"
              v-model="password"
              type="password"
              required
            />
          </div>
          <Button type="submit" class="w-full">Login</Button>
        </form>
      </CardContent>
      <CardFooter>
        <p class="text-sm text-center w-full">
          Don't have an account?
          <router-link to="/register" class="text-primary hover:underline">Register</router-link>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>

