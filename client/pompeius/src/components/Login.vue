<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-col :cols="4">
        <v-card>
          <v-card-title justify="center">Login</v-card-title>
          <v-card-actions>
            <v-form v-model="loginValid" ref="loginForm">
              <v-text-field
                :rules="emailRules"
                append-icon="mdi-email"
                v-model="email"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                :append-icon="showChars ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showChars ? 'text' : 'password'"
                :rules="passwordRules"
                required
                @click:append="showChars = !showChars"
              ></v-text-field>
              <v-btn v-on:click="login">Login</v-btn>
            </v-form>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import * as axios from "axios";
import { mapGetters, mapActions } from "vuex";
import { USER_STATUSES } from "../constants"
export default {
  name: "Login",
  data: function() {
    return {
      email: "",
      password: "",
      showChars: false,
      loginValid: false,
      passwordRules: [v => !!v || "Password is required"],
      emailRules: [
        v => !!v || "Email is required",
        v => /.+@.+/.test(v) || "Invalid Email address"
      ]
    };
  },
  methods: {
    ...mapActions("user", ["setLogin", "setUserStatus"]),
    login() {
      if (!this.$refs.loginForm.validate()) {
        return;
      }
      axios
        .post("/api/auth/login", {
          email: this.email,
          password: this.password
        })
        .then(response => {
          let responseData = response.data.data;
          this.setLogin({
            email: responseData.email,
            id: responseData._id,
            authorizationToken: responseData.token
          });
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${responseData.token}`;
          this.$socket.emit('userConnect', this.getUserInfo.id);
          this.setUserStatus(USER_STATUSES.ONLINE);
        })
        .catch(() => {});
      // Parse errors
    }
  },
  computed: {
    ...mapGetters("user", ["getUserInfo"])
  }
};
</script>

<style scoped>
  .v-form {
    width: 100%
  }
</style>
