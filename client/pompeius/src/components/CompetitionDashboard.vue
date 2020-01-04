<template>
  <v-sheet>
    <v-row justify="end">
      <v-col :cols="5">
        <ProblemDescription text="Problem description here"></ProblemDescription>
      </v-col>
      <v-col :cols="7">
        <v-sheet :height="500">
          <Editor v-model="userInput" @init="editorInit" :lang="userLang" :theme="theme"></Editor>
        </v-sheet>
      </v-col>
      <v-btn v-on:click="openDrawer">Open</v-btn>
    </v-row>
    <v-navigation-drawer
      v-model="showOpponent"
      absolute
      right
      temporary
      hide-overlay
      height="400"
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
            :width="opponentWidth"
            :height="opponentHeight"
            :options="opponentInputOptions"
          ></Editor>
        </div>
      </v-card>
    </v-navigation-drawer>
  </v-sheet>
</template>

<script>
/*eslint-disable*/
import { mapActions } from "vuex";
import Editor from "vue2-ace-editor";
import ProblemDescription from './ProblemDescription.vue'
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
        fontSize: "4pt"
      },
      io: null,
      theme: "chrome",
      userLang: "java",
      opponentLang: "java",
      userHeight: 500,
      opponentHeight: 250,
      opponentWidth: 290,
      showOpponent: false
    };
  },
  sockets: {
    textUpdate: function(data) {
      this.opponentInput = data;
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
    ProblemDescription
  }
};
</script>

<style scoped>
.blur {
  filter: progid:DXImageTransform.Microsoft.Blur(PixelRadius='3');
  -webkit-filter: url(#blur-filter);
  filter: url(#blur-filter);
  -webkit-filter: blur(3px);
  filter: blur(3px);
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
</style>
