<template>
    <div v-html="compileMarkdown" class="scrollable border-right"></div>
</template>

<script>
/*eslint-disable*/
import { mapActions } from "vuex";
import marked from "marked";
export default {
  name: "ProblemDescription",
  props: ['text'],
  computed: {
      compileMarkdown () {
          return marked(this.text, { sanitize: true })
      }
  }
};
</script>

<style scoped>
.scrollable {
    overflow-y: auto;
    height: inherit;
}

</style>
