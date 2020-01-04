<template>
  <div id="app">
    <v-app>
      <div v-if="!getLoginStatus">
        <Login></Login>
      </div>
      <div v-else>
        <Header></Header>
        <CompetitionDashboard></CompetitionDashboard>
      </div>
    </v-app>
  </div>
</template>

<script>
import * as axios from "axios";
import { mapGetters } from "vuex";
import Header from "./components/Header.vue";
import CompetitionDashboard from "./components/CompetitionDashboard.vue";
import Login from "./components/Login.vue";
import constants from "./constants";

export default {
  name: "app",
  components: {
    Header,
    CompetitionDashboard,
    Login
  },
  computed: {
    ...mapGetters("user", ["getLoginStatus"])
  },
  created() {
    axios.defaults.baseURL =
      constants.NETWORK.SERVER_URL + ":" + constants.NETWORK.PORT;
    axios.defaults.headers.post["Content-Type"] =
      "application/x-www-form-urlencoded";
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
