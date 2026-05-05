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

const POPUP_NAME = 'steam_auth_popup'
const POPUP_PARAM = '_steam_auth_popup'

// Login - open Steam auth in a popup so the OpenID flow's URLs (Steam's pages
// and the API redirect) never enter the main window's history. The popup
// loads the SPA at the redirect_to with POPUP_PARAM set, signals the opener,
// and closes itself (see the popup handler in main.ts).
const login = (): void => {
  const currentPath = window.location.pathname + window.location.search + window.location.hash
  const redirectUrl = new URL(currentPath, window.location.origin)
  redirectUrl.searchParams.set(POPUP_PARAM, '1')
  const redirectTo = redirectUrl.pathname + redirectUrl.search + redirectUrl.hash

  const loginUrl = new URL(OffstylesApi.getLoginUrl(), window.location.origin)
  loginUrl.searchParams.set('redirect_to', redirectTo)

  const width = 800
  const height = 700
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2)
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2)
  const popup = window.open(
    loginUrl.toString(),
    POPUP_NAME,
    `width=${width},height=${height},left=${left},top=${top}`
  )

  if (!popup) {
    // Popup blocked: fall back to a full-page redirect (without the popup param).
    const fallbackUrl = new URL(OffstylesApi.getLoginUrl(), window.location.origin)
    fallbackUrl.searchParams.set('redirect_to', currentPath)
    window.location.href = fallbackUrl.toString()
    return
  }

  const cleanup = () => {
    window.removeEventListener('message', onMessage)
    window.clearInterval(closedCheck)
  }

  const onMessage = async (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return
    if (event.source !== popup) return
    if (event.data !== 'steam-auth-success') return
    cleanup()
    await fetchUser()
  }

  // If the popup is closed without sending a success message (user cancelled,
  // or window.opener was severed by cross-origin policies), still refresh
  // user state so a successful sign-in is reflected.
  const closedCheck = window.setInterval(() => {
    if (popup.closed) {
      cleanup()
      fetchUser()
    }
  }, 500)

  window.addEventListener('message', onMessage)
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
