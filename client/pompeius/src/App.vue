<template>
  <div id="app">
    <Header></Header>
    <CompetitionDashboard></CompetitionDashboard>
    <CompileDashboard></CompileDashboard>
  </div>
</template>

<script>
import Header from './components/Header.vue'
import CompetitionDashboard from './components/CompetitionDashboard.vue'
import CompileDashboard from './components/CompileDashboard.vue'

export default {
  name: 'app',
  components: {
    Header,
    CompetitionDashboard,
    CompileDashboard
  },
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
