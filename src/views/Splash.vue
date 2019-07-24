<template>
  <div class="splash">
    <img alt="Minichat welcome" src="../assets/welcome.jpg">
    <div class="redirect">
      <span class="unselectable" @click="redirect">跳转 | {{ second }}s</span>
    </div>
    <footer class="footer unselectable">
      <strong>Minichat</strong><br>
      <span>Copyright @ 2018 xpfxzxc All Rights Reserved</span>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Splash',
  data() {
    return {
      second: 3,
    }
  },
  methods: {
    redirect() {
      this.$router.replace('login')
    }
  },
  beforeCreate() {
    this.intervalId = 0,
    this.timeoutId = 0
  },
  mounted() {
    this.intervalId = setInterval(() => {
      this.second -= 1
      if (this.second === 0) {
        clearInterval(this.intervalId)
      }
    }, 1000)
    this.timeoutId = setTimeout(() => {
      this.$router.replace('/login')
    }, 3000)
  },
  beforeDestroy() {
    clearInterval(this.intervalId)
    clearTimeout(this.timeoutId)
  }
}
</script>

<style lang="less">
.splash {
  position: relative;
  width: 100%;
  height: 100%;

  img {
    width: 100%;
    height: 80%;
    opacity: .7;
  }

  .redirect {
    margin-top: 2%;
    margin-right: 3%;
    text-align: right;
  }

  .footer {
    position: absolute;
    bottom: 5%;
    width: 100%;
    text-align: center;

    strong {
      font-size: 1.5em;
      text-transform: uppercase;
    }

    span {
      color: #777;
      font-size: .75em;
    }
  }
}
</style>