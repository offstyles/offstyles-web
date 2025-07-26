import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'recent-records',
      component: () => import('../views/RecentRecordsView.vue')
    },
    {
      path: '/maps',
      name: 'maps',
      component: () => import('../views/MapsView.vue'),
    },
    {
      path:'/maps/:mapName',
      name: 'single-map',
      component: () => import('../views/MapsView.vue'),
      props: true
    },
    {
      path: '/players',
      name: 'players',
      // route level code-splitting
      // this generates a separate chunk (ServerTrackerView.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/PlayersView.vue')
    },
    {
      path:'/players/:playerSteamId',
      name: 'single-player',
      component: () => import('../views/PlayersView.vue'),
      props: true
    }
  ],
})

export default router
