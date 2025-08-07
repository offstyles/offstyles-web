import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { User } from '@/types/User'
import OffstylesApi from '@/api/offstylesApi'

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
  
  console.log('Making API call to get current user')
  isLoading.value = true
  try {
    const userData = await OffstylesApi.getCurrentUser()
    user.value = userData
    console.log('User data set:', userData)
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
  window.location.href = OffstylesApi.getLoginUrl()
}

// Logout - redirect to logout endpoint
const logout = (): void => {
  console.log('Logout called')
  window.location.href = OffstylesApi.getLogoutUrl()
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
