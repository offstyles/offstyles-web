import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// If this window is the Steam auth popup returning from a successful sign-in,
// signal the opener and close instead of mounting the app. Keeps the auth
// flow's history entries out of the main window. See login() in stores/auth.ts.
const isSteamAuthPopup =
  new URLSearchParams(window.location.search).get('_steam_auth_popup') === '1' &&
  (Boolean(window.opener) || window.name === 'steam_auth_popup')

if (isSteamAuthPopup) {
  try {
    window.opener?.postMessage('steam-auth-success', window.location.origin)
  } catch {
    // opener may be inaccessible due to cross-origin policies; closing still helps
  }
  window.close()
} else {
  const app = createApp(App)
  app.use(router)
  app.mount('#app')
}
