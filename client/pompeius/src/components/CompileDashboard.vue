<template>
  <div class="border-up">
    <v-tabs background-color="secondary lighten-3" dense>
      <v-tab>Output</v-tab>
      <v-tab>Test</v-tab>
      <v-spacer></v-spacer>
      <v-container>
        <v-row align="center">
          <v-col :col="12">
              <v-btn
              :loading="waitForResponse"
              :disabled="finishedMatch"
              v-on:click="finish"
              class="vertical-center padding"
              right
              color="green lighten-2"
              title="Finish"
            >
              Finish
            </v-btn>
            <v-btn
              :loading="waitForResponse"
              :disabled="finishedMatch"
              v-on:click="submit"
              class="vertical-center padding"
              right
              color="green lighten-3"
              title="Submit code"
            >
              Submit
            </v-btn> 
          </v-col>
        </v-row>
      </v-container>
      <v-tab-item>
        <v-card flat tile max-height="20">
          <v-container max-height="20">
              <v-row>
                  <v-col :cols="12">
            <v-textarea
              :label="execStatus"
              :value="execResponse"
              readonly
              outlined
            ></v-textarea>
                  </v-col>
              </v-row>
          </v-container>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card flat tile>
          <v-container>
            <v-row>
              <v-col :cols="6">
                <v-textarea label="stdin" :value="testStdin" outlined></v-textarea>
              </v-col>
              <v-col :cols="6">
                <v-textarea
                  label="stdout"
                  :value="execResponse"
                  readonly
                  outlined
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-tab-item>
    </v-tabs>
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
  return Buffer.from(UTF8Str).toString("base64");
}

export default {
  name: "CompileDashboard",
  data: function() {
    return {
      waitForResponse: false,
      responseReady: false,
      execStatus: null,
      execResponse: "",
      testStdin: "",
      finishedMatch: false
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
          this.execStatus = null;
          let message = "";
          if (responseData.status.id != constants.ACCEPTED_SUBMISSION_STATUS) {
            this.execStatus = "Compilation Error";
            message = responseData.compile_output || responseData.stderr;
          } else {
            this.execStatus = "Accepted Submission";
            message = responseData.stdout;
          }
          this.execResponse = base64toUTF8(message);
        })
        .catch(() => {
          this.execStatus = "Invalid Submission";
          this.waitForResponse = false;
          this.responseReady = true;
          this.execResponse = "Invalid Submission";
        });
    },
    finish () {
        this.$socket.emit('finished');
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
