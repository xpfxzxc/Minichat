<template>
  <mu-flex class="login" v-loading="logining">
    <div class="top-part unselectable">
        <span class="version">v1.0.0</span>
        <h1>Minichat</h1>
    </div>
      
    <div id="login-form">
      <div class="card">
        <mu-card-text>
          <mu-flex class="form-fields" justify-content="center">
            <mu-text-field v-model="nickname" @keyup.enter="loginNickname" placeholder="昵称" help-text="昵称为1-10长度的字符" icon="account_circle"></mu-text-field>
          </mu-flex>
        </mu-card-text>
      </div>

      <mu-flex class="form-btn-group" wrap="wrap">
        <mu-button class="form-btn" color="primary" :disabled="!nickname.trimLeft().length" full-width large round @click="loginNickname">昵称登录</mu-button>
        <mu-button full-width large round @click="pickRandomNickname">随机昵称</mu-button>
      </mu-flex>
    </div>
  </mu-flex>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      nickname: this.$localStorage.getItemOrDefault('nickname', ''),
      logining: false
    }
  },
  methods: {
    pickRandomNickname() {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
      const digits = '0123456789'
      this.nickname = (
        Array.from({ length: 8 }, () => alphabet[parseInt(Math.random() * alphabet.length)])
          .concat(Array.from({ length: 3 }, () => digits[parseInt(Math.random() * digits.length)]))
      ).join('')
    },
    loginNickname() {
      if (this.nickname.trimLeft().length === 0) {
        return;
      }
      
      this.$localStorage.setItem('nickname', this.nickname)

      this.logining = true

      const cb = () => {
        this.$socket.removeListener('connect', cb)
        this.$router.replace('public')
      }
      this.$socket.on('connect', cb)

      this.$socket.connect()
    }
  },
  mounted() {
    this.loginNickname()
  }
}
</script>

<style lang="less">
.login {
  width: 100%;
  height: 100%;

  .top-part {
    position: relative;
    width: 100%;
    height: 50%;
    background-color: #09bb07;

    .version {
      padding: 5px;
      font-size: 0.875em;
    }

    h1 {
      position: absolute;
      top: 45%;
      left: 50%;
      transform: translate(-50%, -50%);
      margin: 0;
      color: #fff;
      font-size: 4rem;
      text-align: center;
    }
  }

  .card {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    box-shadow: 0 1px 5px rgba(0,0,0,0.25);
    background-color: #fff;
  }

  .form-fields {
    margin-bottom: 20px;
  }

  .form-btn-group {
    position: absolute;
    top: 80%;
    left: 50%;
    width: 70%;
    transform: translate(-50%, -50%);
  }

  .form-btn {
    margin-bottom: 10%;
  }
}
</style>