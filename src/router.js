import Vue from 'vue'
import Router from 'vue-router'
import Splash from './views/Splash.vue'
import Login from './views/Login'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'splash',
      component: Splash,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/public',
      name: 'public',
      component: () => import('./views/PublicRoom'),
    },
    {
      path: '/public/online',
      name: 'public-online-list',
      component: () => import('./views/PublicOnlineList'),
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (['splash', 'login'].includes(to.name)) {
    Vue.prototype.$socket.disconnect()
    next()
  } else if (!Vue.prototype.$localStorage.hasItem('nickname')) {
    next('login')
  } else if (!Vue.prototype.$socket.connected) {
    const cb = () => {
      Vue.prototype.$socket.removeListener('connect', cb)
      next()
    }
    Vue.prototype.$socket.on('connect', cb)

    Vue.prototype.$socket.connect()
  } else {
    next()
  }
})

export default router