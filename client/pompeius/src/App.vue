<template>
  <div id="app">
    <v-app>
      <div v-if="!getLoginStatus">
        <Login></Login>
      </div>
      <div v-else>
        <Header></Header>
        <div v-if="online">
          <MainDashboard></MainDashboard>
        </div>
        <v-fade-transition>
        <div v-if="inMatch">
          <CompetitionDashboard></CompetitionDashboard>
        </div>
        </v-fade-transition>
      </div>
    </v-app>
  </div>
</template>

<script>
/*eslint-disable*/
import * as axios from "axios";
import { mapGetters } from "vuex";
import Header from "./components/Header.vue";
import CompetitionDashboard from "./components/CompetitionDashboard.vue";
import MainDashboard from "./components/MainDashboard.vue";
import Login from "./components/Login.vue";
import { NETWORK, USER_STATUSES } from "./constants";

export default {
  name: "app",
  components: {
    Header,
    CompetitionDashboard,
    MainDashboard,
    Login
  },
  computed: {
    ...mapGetters("user", ["getLoginStatus", "getUserStatus"]),
    online() {
      return this.getUserStatus === USER_STATUSES.ONLINE;
    },
    inMatch() {
      console.log(this.getUserStatus)
      return this.getUserStatus === USER_STATUSES.IN_MATCH;
    }
  },
  created() {
    axios.defaults.baseURL =
      NETWORK.SERVER_URL + ":" + NETWORK.PORT;
    axios.defaults.headers.post["Content-Type"] =
      "application/x-www-form-urlencoded";
    document.addEventListener('beforeunload', this.closeApp)
  },
  methods: {
    closeApp() {
      this.$socket.emit("disconnect");
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#app .v-card__text {
  margin: 10px;
}
#app .v-card__actions {
  margin: 10px;
}

.header {
  height: 7vh;
}

.middleSection {
  height: 87vh;
}

.footer {
  height: 0vh;
}

.border-right {
    border-color: rgba(50, 50, 50, 0.2);
    border-style: solid;
    border-width: 0px 1px 0px 0px;
}

.border-left {
    border-color: rgba(50, 50, 50, 0.2);
    border-style: solid;
    border-width: 0px 0px 0px 1px;
}

.border-down {
    border-color: rgba(50, 50, 50, 0.2);
    border-style: solid;
    border-width: 0px 0px 1px 0px;
}

.border-up {
    border-color: rgba(50, 50, 50, 0.2);
    border-style: solid;
    border-width: 1px 0px 0px 0px;
}
</style>
