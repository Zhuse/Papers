<template>
  <v-sheet>
      Waiting for match...
  </v-sheet>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { USER_STATUSES } from '../constants'

export default {
  name: "MainDashboard",
  data: function() {
    return {
    };
  },
  created () {
    this.$socket.emit('autoMatch');
  },
  sockets: {
    textUpdate: function(data) {
      this.opponentInput = data;
    },
    matchInfo: function(match) {
      this.setMatch(match);
      this.setUserStatus(USER_STATUSES.IN_MATCH);
    }
  },
  computed: {
    ...mapGetters("user", ["getUserInfo"]),
  },
  methods: {
    ...mapActions("submission", ["changeText"]),
    ...mapActions("user", ["setUserStatus", "setMatch"]),
  }
};
</script>

<style scoped>
</style>
