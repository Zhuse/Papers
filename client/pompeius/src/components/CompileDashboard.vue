<template>
  <v-card color="grey darken-3" flat tile align-end>
    <v-toolbar dense>
      <v-spacer></v-spacer>

      <v-btn :loading="waitForResponse"
        v-on:click="submit">Submit
      </v-btn>
    </v-toolbar>
    <v-alert v-model="responseReady">execResponse
    </v-alert>
  </v-card>
</template>

<script>
import { post } from 'axios'
import { mapState, mapActions } from 'vuex'
export default {
  name: "CompileDashboard",
  data: function() {
    return {
      waitForResponse: false,
      responseReady: false,
      execResponse: ''
    };
  },
  methods: {
    ...mapActions('submission', [
      'changeText'
    ]),
    submit () {
      const editorText = this.editorText;
      this.waitForResponse = true;
      post('/submission', {
        source_code: editorText,
        language_id: 27
      }).then(() => {
        this.waitForResponse = false;
        this.responseReady = true;
      })
    }
  },
  computed: {
    ...mapState('submission', [
      'editorText'
    ])
  },
  watch: {},
  components: {}
};
</script>

<style scoped>
</style>
