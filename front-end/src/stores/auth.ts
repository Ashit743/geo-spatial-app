import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, register as apiRegister } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUser = (newUser: any) => {
    user.value = newUser
  }

  const login = async (email: string, password: string) => {
    const response = await apiLogin(email, password)
    setToken(response.token)
    setUser(response.user)
    return response
  }

  const register = async (email: string, password: string) => {
    const response = await apiRegister(email, password)
    return response
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  const reset = () => {
    token.value = null
    user.value = null
  }

  return { token, user, isAuthenticated, login, register, logout, reset }
})

