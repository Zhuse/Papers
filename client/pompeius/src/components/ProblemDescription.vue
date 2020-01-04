<template>
    <vue-markdown>{{ text }}</vue-markdown>
</template>

<script>
/*eslint-disable*/
import { mapActions } from "vuex";
import VueMarkdown from "vue-markdown";
export default {
  name: "ProblemDescription",
  props: ['text'],
  components: {
    VueMarkdown
  }
};
</script>

<style scoped>
</style>
