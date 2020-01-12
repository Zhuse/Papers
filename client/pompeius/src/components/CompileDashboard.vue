<template>
  <div class="border-up">
    <v-tabs background-color="secondary lighten-3" v-model="activeTab" dense>
      <v-tab>Output</v-tab>
      <v-tab>Test</v-tab>
      <v-spacer></v-spacer>
      <v-container>
        <v-row align="center">
          <v-col :col="12">
            <v-btn
              :loading="!finishedMatch && waitForResponse"
              :disabled="finishedMatch"
              v-on:click="finish"
              class="vertical-center padding"
              right
              color="green lighten-2"
              title="Finish"
            >Finish</v-btn>
            <v-btn
              :loading="!finishedMatch && waitForResponse"
              :disabled="finishedMatch"
              v-on:click="submit"
              class="vertical-center padding"
              right
              color="green lighten-3"
              title="Submit code"
            >Submit</v-btn>
            <v-btn
              :loading="waitForResponse"
              v-on:click="execute"
              class="vertical-center padding"
              right
              color="green lighten-4"
              title="Test code"
            >Test</v-btn>
          </v-col>
        </v-row>
      </v-container>
      <v-tab-item>
        <v-card flat tile max-height="20">
          <v-container max-height="20">
            <v-row>
              <v-col :cols="12">
                <v-textarea :label="submissionStatus" :value="submissionResponse" readonly outlined></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card flat tile>
          <v-container>
            <v-row>
              <v-col :cols="5">
                <v-textarea label="stdin" v-model="testStdin" outlined></v-textarea>
              </v-col>
              <v-col :cols="7">
                <v-textarea label="stdout" :value="execResponse" readonly outlined></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-tab-item>
    </v-tabs>
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
      tabKeys: {
          output: 1,
          test: 1
      },
      activeTab: this.tabKeys.output
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

.vertical-center {
  margin: 0;
  top: 50%;
  float: right;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}

.padding {
  display: inline;
  padding: 3px;
}
</style>
