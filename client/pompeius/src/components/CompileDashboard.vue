<template>
    <v-tabs background-color="secondary lighten-3" v-model="activeTab" height="30px">
      <v-tab>Output</v-tab>
      <v-tab>Test</v-tab>
      <v-spacer></v-spacer>
      <v-container>
        <v-row align="center" no-gutters>
          <v-col :col="12">
            <v-btn
              :loading="!finishedMatch && waitForResponse"
              :disabled="finishedMatch"
              v-on:click="finish"
              class="vertical-center padding"
              right
              color="green lighten-2"
              title="Finish"
              height="20px"
            >Finish</v-btn>
            <v-btn
              :loading="!finishedMatch && waitForResponse"
              :disabled="finishedMatch"
              v-on:click="submit"
              class="vertical-center padding"
              right
              outlined
              icon
              color="white"
              title="Submit code"
            >
              <v-icon>mdi-send</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
      <v-tab-item>
        <v-card height="100%">
          <v-container>
            <v-row>
              <v-col :cols="12">
                <v-textarea :label="submissionStatus" :value="submissionResponse" no-resize readonly outlined></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card height="100%">
          <v-container>
            <v-row>
              <v-col :cols="6">
                <v-textarea label="stdin" :value="execResponse" outlined></v-textarea>
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
