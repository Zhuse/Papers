<template>
  <v-container>
    <v-row>
      <v-col :cols="9">
        <v-card>
          <Editor
            v-model="userInput"
            @init="editorInit"
            :lang="userLang"
            :theme="theme"
            :width="userWidth"
            :height="userHeight"
          ></Editor>
        </v-card>
      </v-col>
      <v-col :cols="3">
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          class="blur-svg"
        >
          <defs>
            <filter id="blur-filter">
              <feGaussianBlur stdDeviation="10" />
            </filter>
          </defs>
        </svg>
        <v-card>
          <div class="blur">
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
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Editor from "vue2-ace-editor";
export default {
  name: "CompetitionDashboard",
  data: function() {
    return {
      userInput: "",
      opponentInput: "",
      opponentInputOptions: {
        readOnly: true
      },
      io: null,
      theme: "chrome",
      userLang: "java",
      opponentLang: "java",
      userHeight: 500,
      userWidth: 870,
      opponentHeight: 250,
      opponentWidth: 290
    };
  },
  sockets: {
    textUpdate: function(data) {
      this.opponentInput = data;
    }
  },
  methods: {
    editorInit: function() {
      require("brace/ext/language_tools"); //language extension prerequsite...
      require("brace/mode/html");
      require("brace/mode/javascript"); //language
      require("brace/mode/java"); //language
      require("brace/mode/less");
      require("brace/theme/chrome");
      require("brace/snippets/javascript"); //snippet
    }
  },
  watch: {
    userInput() {
      this.$socket.emit("textUpdate", this.userInput);
    }
  },
  components: {
    Editor
  }
};
</script>

<style scoped>
.blur {
  filter: progid:DXImageTransform.Microsoft.Blur(PixelRadius='10');
  -webkit-filter: url(#blur-filter);
  filter: url(#blur-filter);
  -webkit-filter: blur(3px);
  filter: blur(3px);
}
.blur-svg {
  display: none;
}
</style>
