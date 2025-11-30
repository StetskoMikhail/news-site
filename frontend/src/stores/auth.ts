import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/api'

interface User {
  id: number
  username: string
  email: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('jwt'))

  const isAuthenticated = computed(() => !!token.value)
  const isEditor = computed(() => user.value?.role === 'editor')

  const setAuth = (userData: User, jwt: string) => {
    user.value = userData
    token.value = jwt
    localStorage.setItem('jwt', jwt)
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('jwt')
  }

  const restoreAuth = async () => {
    if (token.value) {
      try {
        const userData = await authService.getMe(token.value)
        user.value = userData
      } catch (error) {
        logout()
      }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isEditor,
    setAuth,
    logout,
    restoreAuth
  }
})