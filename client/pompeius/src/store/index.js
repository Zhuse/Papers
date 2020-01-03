import Vue from 'vue'
import Vuex from 'vuex'
import submissionModule from './modules/submission.js'
import userModule from './modules/user.js'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    submission: submissionModule,
    user: userModule
  }
})
