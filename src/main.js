import Vue from 'vue'
import App from './App.vue'
import router from './router'
import MuseUI from 'muse-ui'
import io from 'socket.io-client'
import 'muse-ui/dist/muse-ui.css'
import 'typeface-roboto'
import 'muse-ui-message/dist/muse-ui-message.css'
import Message from 'muse-ui-message'
import Loading from 'muse-ui-loading';
import Preview from 'vue-photo-preview'
import 'vue-photo-preview/dist/skin.css'
import localStorageManager from './localStorageManager'
import 'muse-ui-loading/dist/muse-ui-loading.css'; // load css

Vue.config.productionTip = false

Vue.use(MuseUI)
Vue.use(Message)
Vue.use(Loading, {
  overlayColor: 'rgba(0, 0, 0, .4)',
  color: 'warning',
  size: 70,
  className: 'animated fadeIn slower',
  text: '连接中......'
});
Vue.use(Preview, { fullscreenEl: false })

Vue.prototype.$localStorage = localStorageManager
Vue.prototype.$login = {
  nickname: null
}
Vue.prototype.$socket = io(
  process.env.NODE_ENV === 'development' ? 'http://localhost:60300/' : 'https://minichat777.herokuapp.com/',
  { secure:true, autoConnect: false }
)
Vue.prototype.$socket.on('connect', () => {
  console.log('连接服务器成功！')
  console.log('设置昵称')
  Vue.prototype.$login.nickname = localStorageManager.getItemOrDefault('nickname', '')
  Vue.prototype.$socket.emit('set_nickname', Vue.prototype.$login.nickname, () => {
    console.log('设置昵称成功！')
  })
})
Vue.prototype.$socket.on('disconnect', () => {
  console.log('连接断开')
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')