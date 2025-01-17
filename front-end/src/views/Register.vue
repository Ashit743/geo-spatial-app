<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast/use-toast'

const router = useRouter()
const { toast } = useToast()

const email = ref<string>('')
const password = ref<string>('')

const handleRegister = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]') as {
    email: string
    password: string
  }[]
  
  const existingUser = users.find((user) => user.email === email.value)

  if (existingUser) {
    toast({
      title: 'Error',
      description: 'User already exists. Please log in.',
      variant: 'destructive',
    })
    return
  }

  users.push({ email: email.value, password: password.value })
  localStorage.setItem('users', JSON.stringify(users))
  toast({
    title: 'Success',
    description: 'Registration successful! Please log in.',
  })
  router.push('/login')
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <Card class="w-[350px]">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create a new account</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleRegister" class="space-y-4">
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
          <Button type="submit" class="w-full">Register</Button>
        </form>
      </CardContent>
      <CardFooter>
        <p class="text-sm text-center w-full">
          Already have an account?
          <router-link to="/login" class="text-primary hover:underline">Login</router-link>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>

