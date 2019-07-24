<template>
  <div id="app">
    <keep-alive :include="cachedViews">
      <router-view>
      </router-view>
    </keep-alive>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cachedViews: []
    }
  }
}
</script>

<style lang="less">
@import url('~animate.css/animate.min.css');

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  position: relative;
  width: 100%;
  height: 100%;
}

.unselectable {
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
