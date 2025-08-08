import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { User } from '@/types/User'
import OffstylesApi from '@/api/offstylesApi'

const user: Ref<User | null> = ref(null)
const isLoading: Ref<boolean> = ref(false)

const isLoggedIn = computed(() => {
  return user.value !== null
})

// Fetch current user data from API
const fetchUser = async (): Promise<void> => {
  isLoading.value = true
  try {
    const userData = await OffstylesApi.getCurrentUser()
    user.value = userData
  } catch (error) {
    console.error('Failed to fetch user:', error)
    user.value = null
  } finally {
    isLoading.value = false
  }
}

// Login - redirect to Steam auth
const login = (): void => {
  window.location.href = OffstylesApi.getLoginUrl()
}

// Logout - redirect to logout endpoint
const logout = (): void => {
  window.location.href = OffstylesApi.getLogoutUrl()
}

// Initialize auth state
const initAuth = async (): Promise<void> => {
  await fetchUser()
}

// Export the singleton auth store
export const useAuth = () => {
  return {
    user: computed(() => user.value),
    isLoggedIn,
    isLoading: computed(() => isLoading.value),
    login,
    logout,
    initAuth
  }
}
