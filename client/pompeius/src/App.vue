<template>
  <div id="app">
    <h1>Pompeius</h1>
    <CompetitionDashboard></CompetitionDashboard>
  </div>
</template>

<script>
import CompetitionDashboard from './components/CompetitionDashboard.vue'

export default {
  name: 'app',
  components: {
    CompetitionDashboard
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
