import Vue from 'vue'
import App from './App.vue'
import store from './store'
import Vuetify from './plugins/vuetify';
import VueSocketIO from 'vue-socket.io'

Vue.use(new VueSocketIO({
  debug: true,
  connection: 'http://localhost:3000',
  vuex: {
      store,
      actionPrefix: 'SOCKET_',
      mutationPrefix: 'SOCKET_'
  }
}))

new Vue({
  store,
  Vuetify,
  render: h => h(App)
}).$mount('#app')
