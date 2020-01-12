<template>
  <v-sheet>
    <v-dialog v-model="matchDialog" scrollable max-width="300px">
      <v-card :height="300">
        <v-card-text>
          <div v-if="!isTie">
            <b>{{ matchResult.winner }}</b> wins with a score of
            <br />
            <br />
            <span class="winner-score">
              {{ matchResult.winnerScore }}
            </span>
            <br />
            <br />
            {{ matchResult.loser }} score:
            <b>{{ matchResult.loserScore }}</b>
          </div>
          <div v-else>
            <b>Tie!</b> both players received a score of
            <br />
            <br />
            <span class="winner-score">
              {{ matchResult.winnerScore }}
            </span>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-row justify="end" no-gutters>
      <v-col :cols="5">
        <v-sheet height="93vh">
          <ProblemDescription :text="getProblemDescription"></ProblemDescription>
        </v-sheet>
      </v-col>
      <v-col :cols="7">
        <v-sheet height="62vh">
          <Editor
            v-model="userInput"
            @init="editorInit"
            :lang="userLang"
            :theme="theme"
            :options="userInputOptions"
          ></Editor>
        </v-sheet>
        <CompileDashboard></CompileDashboard>
        <v-sheet class="side-dashboard">
          <v-row dense>
            <v-col>
              <v-btn v-on:click="openDrawer" title="View opponent's editor" small fab>
                <v-icon>mdi-account-group</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-tooltip v-model="showAlert" left>
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-on:click="alertBtnEvent"
                    title="Show alert"
                    :class="showAlertBtn? null: 'd-none'"
                    small
                    fab
                  >
                    <v-icon
                      :large="showAlert? false: true"
                      :color="showAlert? 'black':'orange darken-1'"
                    >{{ showAlert? 'mdi-window-close': 'mdi-alert-circle-outline'}}</v-icon>
                  </v-btn>
                </template>
                <span>{{ matchAlertMsg }}</span>
              </v-tooltip>
            </v-col>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>
    <v-navigation-drawer
      v-model="showOpponent"
      absolute
      right
      temporary
      floating
      hide-overlay
      height="300"
      width="340"
    >
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        class="blur-svg"
      >
        <defs>
          <filter id="blur-filter">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
      </svg>
      <v-card>
        <div class="blur unselectable">
          <Editor
            v-model="opponentInput"
            @init="editorInit"
            :lang="opponentLang"
            :theme="theme"
            width="100%"
            height="300"
            :options="opponentInputOptions"
          ></Editor>
        </div>
      </v-card>
    </v-navigation-drawer>
  </v-sheet>
</template>

<script>
/*eslint-disable*/
import { mapGetters, mapActions } from "vuex";
import Editor from "vue2-ace-editor";
import ProblemDescription from "./ProblemDescription.vue";
import CompileDashboard from "./CompileDashboard.vue";
import { USER_STATUSES } from "../constants";

export default {
  name: "CompetitionDashboard",
  data: function() {
    return {
      userInput: "",
      opponentInput: "",
      opponentInputOptions: {
        readOnly: true,
        highlightActiveLine: false,
        highlightSelectedWord: false,
        cursorStyle: "ace",
        selectionStyle: "text",
        fontSize: "4pt",
        showPrintMargin: false
      },
      userInputOptions: {
        showPrintMargin: false
      },
      matchResult: {
        tie: false,
        winner: null,
        loser: null,
        winnerScore: null,
        loserScore: null
      },
      io: null,
      theme: "chrome",
      userLang: "java",
      opponentLang: "java",
      userHeight: 500,
      opponentHeight: 300,
      opponentWidth: 320,
      showOpponent: false,
      matchDialog: false,
      showAlert: false,
      showAlertBtn: false,
      matchAlertMsg: ""
    };
  },
  sockets: {
    textUpdate: function(data) {
      this.opponentInput = data;
    },
    matchUpdates: function(matchResult) {
      this.matchDialog = true;
      this.matchResult = matchResult;
    },
    matchAlert: function(alert) {
      this.showAlertBtn = true;
      this.matchAlertMsg = alert;
    }
  },
  computed: {
    ...mapGetters("user", ["getUserInfo", "getMatch"]),
    getProblemDescription() {
      return this.getMatch.problem.description;
    },
    isTie() {
      return this.matchResult.tie;
    }
  },
  methods: {
    ...mapActions("submission", ["changeText"]),
    editorInit() {
      require("brace/ext/language_tools"); //language extension prerequsite...
      require("brace/mode/html");
      require("brace/mode/javascript"); //language
      require("brace/mode/java"); //language
      require("brace/mode/less");
      require("brace/theme/chrome");
      require("brace/theme/twilight");
      require("brace/snippets/javascript"); //snippet
    },
    openDrawer() {
      this.showOpponent = !this.showOpponent;
    },
    alertBtnEvent() {
      if (this.showAlert) {
        this.showAlertBtn = false;
      }
      this.showAlert = !this.showAlert;
    }
  },
  watch: {
    userInput() {
      this.$socket.emit("textUpdate", this.userInput);
      this.changeText(this.userInput);
    }
  },
  components: {
    Editor,
    ProblemDescription,
    CompileDashboard
  }
};
</script>

<style scoped>
.blur {
  filter: progid:DXImageTransform.Microsoft.Blur(PixelRadius='2');
  -webkit-filter: url(#blur-filter);
  filter: url(#blur-filter);
  -webkit-filter: blur(2px);
  filter: blur(2px);
}
.blur-svg {
  display: none;
}

.unselectable {
  pointer-events: none;
}

.ace_editor {
  height: inherit;
  width: inherit;
}

.v-navigation-drawer__border {
  border-radius: 50px;
}
.side-dashboard {
  position: absolute;
  right: 1vh;
  top: 10vh;
}
.winner-score {
  color: forestgreen;
  font-size: 36px;
}
</style>
