<template>
  <v-container>
    <v-row>
      <v-col :cols="6">
        <Editor v-model="userInput" @init="editorInit" lang="java" theme="chrome" width="580" height="500"></Editor>
      </v-col>
      <v-col :cols="6">
        <Editor v-model="opponentInput" @init="editorInit" lang="java" theme="chrome" width="580" height="500" :options="opponentInputOptions"></Editor>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Editor from 'vue2-ace-editor';
export default {
  name: 'CompetitionDashboard',
  data: function () {
    return {
      userInput: '',
      opponentInput: '',
      opponentInputOptions: {
        readOnly: true
      }
    }
  },
  methods: {
    editorInit: function () {
      require('brace/ext/language_tools') //language extension prerequsite...
      require('brace/mode/html')                
      require('brace/mode/javascript')    //language
      require('brace/mode/java')    //language
      require('brace/mode/less')
      require('brace/theme/chrome')
      require('brace/snippets/javascript') //snippet
    },

    socketInit: function () {}
  },
  watch: {
    userInput(data) {
      this.opponentInput = data;
    }
  },
  components: {
    Editor
  },
  mounted(){

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
