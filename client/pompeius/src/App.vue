<template>
  <div id="app">
    <v-app>
      <div v-if="!getLoginStatus">
        <Login></Login>
      </div>
      <div v-else>
        <Header></Header>
        <CompetitionDashboard></CompetitionDashboard>
        <CompileDashboard></CompileDashboard>
      </div>
    </v-app>
  </div>
</template>

<script>
import * as axios from "axios";
import { mapGetters } from "vuex";
import Header from "./components/Header.vue";
import CompetitionDashboard from "./components/CompetitionDashboard.vue";
import CompileDashboard from "./components/CompileDashboard.vue";
import Login from "./components/Login.vue";
import constants from "./constants";

export default {
  name: "app",
  components: {
    Header,
    CompetitionDashboard,
    CompileDashboard,
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
</style>
