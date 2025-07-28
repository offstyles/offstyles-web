import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { User } from '@/types/User'

const user: Ref<User | null> = ref(null)
const isLoading: Ref<boolean> = ref(false)

const isLoggedIn = computed(() => {
  const loggedIn = user.value !== null
  console.log('isLoggedIn computed:', loggedIn, 'user:', user.value)
  return loggedIn
})

// Fetch current user data from API
const fetchUser = async (): Promise<void> => {
  console.log('fetchUser called')
  
  console.log('Making API call to /api/profile')
  isLoading.value = true
  try {
    const response = await fetch('/api/profile', {
      credentials: 'include'
    })
    console.log('API Response:', response.status, response.ok)
    
    if (response.ok) {
      const userData = await response.json()
      user.value = userData
      console.log('User data set:', userData)
    } else {
      const errorText = await response.text()
      user.value = null
      console.log('API Error:', response.status, errorText)
    }
  } catch (error) {
    console.error('Fetch error:', error)
    user.value = null
  } finally {
    isLoading.value = false
    console.log('fetchUser complete, user:', user.value)
  }
}

// Login - redirect to Steam auth
const login = (): void => {
  console.log('Login called')
  window.location.href = '/api/auth/steam'
}

// Logout - redirect to logout endpoint
const logout = (): void => {
  console.log('Logout called')
  window.location.href = '/api/auth/logout'
}

// Initialize auth state
const initAuth = async (): Promise<void> => {
  console.log('initAuth called')
  await fetchUser()
  console.log('initAuth complete')
}

export const useAuth = () => {
  console.log('useAuth called')
  return {
    user: computed(() => user.value),
    isLoggedIn,
    isLoading: computed(() => isLoading.value),
    login,
    logout,
    initAuth
  }
}