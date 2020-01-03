<template>
  <div>
    <v-app-bar dense bottom fixed>
      <v-spacer></v-spacer>

      <v-btn :loading="waitForResponse" v-on:click="submit">Submit</v-btn>
    </v-app-bar>
    <v-alert v-model="responseReady" class="maintainFormatting">{{ execResponse }}</v-alert>
  </div>
</template>

<script>
import * as axios from "axios";
import { mapState, mapGetters } from "vuex";
import constants from "../constants";

function base64toUTF8(base64Str) {
  let decode;
  base64Str = base64Str.split("\\n").join("");
  decode = Buffer.from(base64Str, "base64");
  return decode.toString("utf-8");
}

function UTF8toBase64(UTF8Str) {
  return Buffer.from(UTF8Str).toString("base64")
}
export default {
  name: "CompileDashboard",
  data: function() {
    return {
      waitForResponse: false,
      responseReady: false,
      execResponse: ""
    };
  },
  methods: {
    submit() {
      this.waitForResponse = true;

      axios
        .post("/api/submission", {
          user: this.getUserId,
          source_code: UTF8toBase64(this.editorText),
          language_id: 27
        })
        .then(response => {
          let responseData = response.data.data;
          this.waitForResponse = false;
          this.responseReady = true;
          let message = "";
          if (responseData.status.id != constants.ACCEPTED_SUBMISSION_STATUS) {
            message = responseData.compile_output || responseData.stderr;
          } else {
            message = responseData.stdout;
          }
          this.execResponse = base64toUTF8(message);
        })
        .catch(() => {
          this.waitForResponse = false;
          this.responseReady = true;
          this.execResponse = "Invalid Submission";
        });
    }
  },
  computed: {
    ...mapState("submission", ["editorText"]),
    ...mapGetters("user", ["getUserInfo"]),
    getUserId() {
      return this.getUserInfo.id;
    }
  },
  watch: {},
  components: {}
};
</script>

<style scoped>
.maintainFormatting {
  white-space: pre;
}
</style>
