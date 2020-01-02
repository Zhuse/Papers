import Vue from 'vue'
import Vuex from 'vuex'
import submissionModule from './modules/submission.js'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    submission: submissionModule,
  }
})
