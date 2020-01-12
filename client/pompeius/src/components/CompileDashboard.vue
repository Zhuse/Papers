<template>
  <div>
    <v-sheet class="d-inline-flex flex-row justify-end align-center gutters">
      <v-btn
        v-on:click="activeMenu == menuIdx.testMenu?
        activeMenu = menuIdx.noMenu: activeMenu = menuIdx.testMenu"
        right
        class="ma-2"
        title="Test code"
        height="70%"
        color="success"
        icon
      >
        <v-icon small>mdi-eyedropper</v-icon>
      </v-btn>
      <v-btn
        :disabled="finishedMatch || waitForResponse"
        v-on:click="activeMenu == menuIdx.submitMenu?
        activeMenu = menuIdx.noMenu: activeMenu = menuIdx.submitMenu"
        right
        color="success"
        title="Submit code"
        height="70%"
        icon
      >
        <v-icon small>mdi-feather</v-icon>
      </v-btn>
      <v-btn
        :disabled="finishedMatch || waitForResponse"
        v-on:click="finish"
        title="Finish"
        height="70%"
        color="success"
        outlined
      >
        <v-icon left small>mdi-telegram</v-icon>
        <span class="smallest-text">Finish</span>
      </v-btn>
    </v-sheet>
    <v-sheet v-show="activeMenu == menuIdx.testMenu">
      <v-container>
        <v-row>
          <v-col :cols="6">
            <v-textarea label="stdin" v-model="testStdin" outlined></v-textarea>
          </v-col>
          <v-col :cols="6">
            <v-textarea label="stdout" :value="execResponse" readonly outlined></v-textarea>
          </v-col>
        </v-row>
        <v-btn
          :disabled="finishedMatch || waitForResponse"
          v-on:click="execute"
          right
          title="Execute code"
          height="100%"
          color="success"
          outlined
        >
          <v-icon left small>mdi-eyedropper</v-icon>
          <span class="smaller-text">Execute</span>
        </v-btn>
      </v-container>
    </v-sheet>
    <v-sheet v-show="activeMenu == menuIdx.submitMenu">
      <v-container>
        <v-row>
          <v-col :cols="12">
            <v-textarea :label="submissionStatus" :value="submissionResponse" readonly outlined></v-textarea>
          </v-col>
        </v-row>
        <v-btn
          :disabled="finishedMatch || waitForResponse"
          v-on:click="submit"
          right
          title="Submit code"
          height="100%"
          color="success"
          outlined
        >
          <v-icon left small>mdi-feather</v-icon>
          <span class="smaller-text">Submit</span>
        </v-btn>
      </v-container>
    </v-sheet>
  </div>
</template>

<script>
/*eslint-disable */
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
  return Buffer.from(UTF8Str).toString("base64");
}

export default {
  name: "CompileDashboard",
  data: function() {
    return {
      waitForResponse: false,
      responseReady: false,
      submissionStatus: null,
      submissionResponse: "",
      execResponse: "",
      testStdin: "",
      finishedMatch: false,
      testMenu: false,
      menuIdx: {
        noMenu: 0,
        testMenu: 1,
        submitMenu: 2
      },
      activeMenu: 0
    };
  },
  methods: {
    submit() {
      this.waitForResponse = true;
      axios
        .post("/api/submission", {
          user: this.getUserId,
          source_code: UTF8toBase64(this.editorText),
          language_id: 27,
          match: this.getMatchId,
          problem: this.getProblemId
        })
        .then(response => {
          let responseData = response.data.data;
          this.waitForResponse = false;
          this.responseReady = true;
          this.submissionStatus = null;
          this.activeTab = 2;
          let message = "";
          if (responseData.status.id != constants.ACCEPTED_SUBMISSION_STATUS) {
            this.submissionStatus = "Compilation Error";
            message = responseData.compile_output || responseData.stderr;
          } else {
            this.submissionStatus = "Accepted Submission";
            message = responseData.stdout;
          }
          this.submissionResponse = base64toUTF8(message);
        })
        .catch(() => {
          this.submissionStatus = "Invalid Submission";
          this.activeTab = 2;
          this.waitForResponse = false;
          this.responseReady = true;
          this.submissionResponse = "Invalid Submission";
        });
    },
    execute() {
      this.waitForResponse = true;
      axios
        .post("/api/execute", {
          user: this.getUserId,
          source_code: UTF8toBase64(this.editorText),
          language_id: 27,
          stdin: UTF8toBase64(this.testStdin)
        })
        .then(response => {
          this.activeTab = 1;
          let responseData = response.data.data;
          this.waitForResponse = false;
          let message = "";
          if (responseData.status.id != constants.ACCEPTED_SUBMISSION_STATUS) {
            message = responseData.compile_output || responseData.stderr;
          } else {
            message = responseData.stdout;
          }
          this.execResponse = base64toUTF8(message);
        })
        .catch(() => {
          this.activeTab = 1;
          this.waitForResponse = false;
          this.execResponse = "Something went wrong";
        });
    },
    finish() {
      this.$socket.emit("finished");
      this.finishedMatch = true;
    }
  },
  computed: {
    ...mapState("submission", ["editorText"]),
    ...mapGetters("user", ["getUserInfo", "getMatch"]),
    getUserId() {
      return this.getUserInfo.id;
    },
    getMatchId() {
      return this.getMatch.id;
    },
    getProblemId() {
      return this.getMatch.problem._id;
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

.smallest-text {
  font-size: 9px;
}

.smaller-text {
  font-size: 10px;
}

.gutters > .v-btn {
  margin: 4px;
}
</style>
