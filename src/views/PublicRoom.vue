<template>
  <div class="public">
    <mu-appbar class="appbar" color="primary">
      <mu-button flat slot="left" @click="logout">退出</mu-button>

      <p class="title unselectable">公共聊天({{ onlineNum }})</p>

      <mu-button icon slot="right" @click="$router.push({ name: 'public-online-list' })">
        <mu-icon value="search"></mu-icon>
      </mu-button>
    </mu-appbar>

    <mu-alert v-if="connectionStatus !== 'connected'" :class="['status-bar', 'unselectable', connectionStatus === 'reconnected' ? 'fadeOut' : 'fadeIn']" :color="statusBarColor">
      <mu-circular-progress v-if="connectionStatus === 'reconnecting'" class="circular-progress" color="warning" :stroke-width="1" :size="14"></mu-circular-progress>
      <mu-icon v-else :value="statusIcon" class="status-icon" size="16"></mu-icon>
      <span class="status-msg">{{ statusMsg }}</span>
    </mu-alert>

    <div class="msg-view" ref="msgView">
      <div class="msg-box" v-for="(message, index) in messageList" v-bind:key="index">
        <div v-if="message.type === 'in_out_tip'" class="in-out-tip">
          {{ message.content }}
        </div>

        <div v-else-if="message.type === 'msg_received'" :class="['msg-recevied', message.hasRead ? '' : 'animated slideInLeft fadeIn']">
          <p class="msg-nickname">{{ message.source }}</p>
          <p v-if="!message.image" class="msg-content">
            <span v-if="!message.image">{{ message.content }}</span>
          </p>
          <img v-else preview="1" :src="message.content" class="image">
        </div>

        <div v-else-if="message.type === 'msg_sent'" :class="['msg-sent', message.hasRead ? '' : 'animated slideInRight fadeIn']">
          <p class="msg-nickname">{{ message.source }}</p>
          <p v-if="!message.image" :class="['msg-content', message.status]">
            {{ message.content }}
          </p>
          <img v-else preview="1" :src="message.content" :class="['image', message.status]">
        </div>
      </div>
    </div>

    <mu-flex class="footer" justify-content="around" align-items="center">
      <mu-text-field class="msg-input" ref="msgInput" v-model="myMsg" @keyup.enter.exact="sendMsg" placeholder="请输入消息..."></mu-text-field>
      <mu-button color="primary" v-if="myMsg.trimLeft().length" icon @click="sendMsg">
        <mu-icon value="send"></mu-icon>
      </mu-button>
      <mu-button color="primary" v-else icon @click="$refs.photoInput.click()">
        <mu-icon value="insert_photo"></mu-icon>
        <input type="file" ref="photoInput" hidden multiple accept="image/*" @change="sendImages">
      </mu-button>
    </mu-flex>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import { isMobile } from '@/utils.js'

export default {
  name: 'public',
  data() {
    return {
      onlineNum: 1,
      connectionStatus: 'connected', // reconnected reconnecting
      myMsg: '',
      messageList: []
    }
  },
  computed: {
    statusMsg() {
      switch (this.connectionStatus) {
        case 'connected':
          return '已连接'
        case 'reconnecting':
          return '重连中...这期间的聊天信息将永久丢失'
        case 'reconnected':
          return '重连成功'
        default:
          throw Error('不明连接状态')
      }
    },
    statusBarColor() {
      switch (this.connectionStatus) {
        case 'connected':
          return 'primary'
        case 'reconnected':
          return 'success'
        case 'reconnecting':
          return 'error'
        default:
          throw Error('不明连接状态')
      }
    },
    statusIcon() {
      switch (this.connectionStatus) {
        case 'connected':
          return 'done'
        case 'reconnected':
          return 'done_outline'
        case 'reconnecting':
          return ''
        default:
          throw Error('不明连接状态')
      }
    }
  },
  methods: {
    hasScrolledMsgViewToBottom() {
      const msgView = this.$refs.msgView
      // 因为得到的像素值不一定是整数
      return Math.abs(msgView.scrollTop + msgView.offsetHeight - msgView.scrollHeight) <= 3
    },
    scrollMsgViewToBottom() {
      const msgView = this.$refs.msgView
      const newScrollTop = Number.MAX_SAFE_INTEGER
      const len = this.messageList.length
      if (this.messageList.length && this.messageList[len - 1].image) {
        setTimeout(() => msgView.scrollTop = newScrollTop)
      } else {
        this.$nextTick(() => msgView.scrollTop = newScrollTop)
      }
    },
    scrollMsgViewToBottomIfNeeded() {
      if (this.hasScrolledMsgViewToBottom()) {
        this.scrollMsgViewToBottom()
      }
    },
    addResizeListenerIfNeeded() {
      if (isMobile()) {
        window.addEventListener('resize', this.onResize)
        console.log('猜测正在使用移动设备')
      }
    },
    removeEventListenerIfNeeded() {
      window.removeEventListener('resize', this.onResize)
    },
    logout() {
      this.$confirm('您确定要断开连接吗？', '提示', {
        type: 'warning'
      }).then(({ result }) => {
        if (result) {
          this.$localStorage.removeItem('nickname')
          this.$router.replace('login')
        }
      });
    },
    /**
     * 移动端键盘弹出时，自动将消息视图内容滚动到底部
     * 不足：PC 端缩小窗口高宽比例时，也会消息视图内容自动滚到底部
     */
    onResize:
      debounce(function() {
        const newAspectRadio = document.body.clientHeight / document.body.clientWidth

        if (newAspectRadio < this.aspectRadio) {
          this.scrollMsgViewToBottom()

          console.log('debounce', 'scrollMsgViewToBottom function called')
        }

        this.aspectRadio = newAspectRadio
      }, 50),
    sendMsg() {
      if (this.myMsg.trimLeft().length === 0) {
        return;
      }

      this.$refs.msgInput.focus()

      const msgSent = {
        type: 'msg_sent',
        content: this.myMsg,
        source: this.$login.nickname,
        status: this.$socket.connected ? 'pending' : 'failed'
      }
      this.messageList.push(msgSent)

      console.log(`发送消息：${msgSent.content}`)
      this.$socket.emit('public chat text', {
        content: msgSent.content,
      }, () => {
        console.log(`成功发送消息：${msgSent.content}`)
        msgSent.status = 'success'
      })

      this.myMsg = ''
    },
    sendImages() {
      const photoInput = this.$refs.photoInput
      const photoList = photoInput.files
      
      for (const photo of photoList) {
        const reader = new FileReader()

        reader.addEventListener('load', () => {
          const imageSent = {
            type: 'msg_sent',
            image: true,
            content: reader.result,
            source: this.$login.nickname,
            status: 'pending'
          }

          this.messageList.push(imageSent)

          this.$previewRefresh()

          this.$socket.emit('public chat image', {
            content: imageSent.content,
            source: imageSent.source,
          }, () => {
            imageSent.status = 'success'
            console.log(`发送图片 ${photo.name} 成功`)
          })
        })

        reader.addEventListener('error', () => {
          console.log(`发送图片 ${photo.name} 失败`)
        })

        reader.readAsDataURL(photo)
      }

      this.$refs.photoInput.value = null
    },
    reconnectedHandler() {
      this.connectionStatus = 'reconnected'
      this.$socket.emit('public chat user in')
    },
    reconnectingHandler() {
      this.connectionStatus = 'reconnecting'
    },
  },
  watch: {
    messageList() {
      const len = this.messageList.length
      if (len > 0 && this.messageList[len - 1]) {
        this.$set(this.messageList[len - 1], 'hasRead', false)
      }

      this.scrollMsgViewToBottomIfNeeded()
    }
  },
  created() {
    this.msgViewPositionY = 0

    this.$parent.cachedViews.push(this.$options.name)

    this.$socket.on('public chat user in', (nickname, onlineNum) => {
      this.messageList.push({
        type: 'in_out_tip',
        content: `${nickname} 进入`
      })
      console.log(`${nickname} 进入公共聊天，${onlineNum} 人在线`)
      this.onlineNum = onlineNum
    })

    this.$socket.on('public chat user out', (nickname, onlineNum) => {
      this.messageList.push({
        type: 'in_out_tip',
        content: `${nickname} 离开`
      })
      console.log(`${nickname} 离开公共聊天， ${onlineNum} 人在线`)
      this.onlineNum = onlineNum
    })

    this.$socket.on('public chat text', msg => {
      console.log(`收到文本: ${msg.content}`)
      
      this.messageList.push(Object.assign({
        type: 'msg_received'
      }, msg))
    })

    this.$socket.on('public chat image', msg => {
      console.log(`收到图片`)

      this.messageList.push(Object.assign({
        type: 'msg_received',
        image: true,
      }, msg))

      this.$previewRefresh()
    })

    this.$socket.on('reconnect', this.reconnectedHandler)
    this.$socket.on('reconnecting', this.reconnectingHandler)

    this.$socket.emit('public chat user in')
  },
  mounted() {
    this.aspectRadio = document.body.clientHeight / document.body.clientWidth
    this.addResizeListenerIfNeeded()
  },
  beforeRouteLeave(to, from, next) {
    if (['splash', 'login'].includes(to.name)) {
      this.$parent.cachedViews.pop()
    }

    // 依据当前位置是否为最底部，设置下次消息视图内容的滚动位置为最底部还是当前位置
    this.msgViewPositionY = this.hasScrolledMsgViewToBottom() ? Number.MAX_SAFE_INTEGER : this.$refs.msgView.scrollTop

    // 避免已阅读的消息重复“渐入”
    this.messageList.forEach(e => this.$set(e, 'hasRead', true))

    next()
  },
  activated() {
    console.log('activated')
    if (this.connectionStatus === 'reconnected') {
      this.connectionStatus = 'connected'
    }
    this.$nextTick(() => this.$refs.msgView.scrollTop = this.msgViewPositionY)
  },
  beforeDestroy() {
    this.$socket.removeListener('public chat user in')
    this.$socket.removeListener('public chat user out')
    this.$socket.removeListener('public chat text')
    this.$socket.removeListener('public chat image')
    this.$socket.removeListener('reconnect', this.reconnectedHandler)
    this.$socket.removeListener('reconnecting', this.reconnectingHandler)

    this.removeEventListenerIfNeeded()
  },
  destroyed() {
    console.log('PublicRoom 组件被销毁')
  }
}
</script>

<style lang="less">
.public {
  position: relative;
  height: 100%;

  p {
    margin: 0;
  }

  .appbar {
    height: 50px;
  }

  .title {
    margin-left: -8px;
    text-align: center;
  }

  .status-bar {
    z-index: 9999;
    position: absolute;
    width: 100%;
    height: 30px;
    min-height: 0;
    border-radius: 2px;
    padding: 5px 10px;

    .status-msg {
      padding-left: 6px;
    }

    @keyframes fadeIn {
      0% {
        opacity: 0;
      }
      100% {
        opacity: .75;
      }
    }

    @keyframes fadeOut {
      0% {
        opacity: .75;
      }
      100% {
        opacity: 0;
      }
    }

    &.fadeIn {
      animation: fadeIn 3s ease-out forwards;
    }

    &.fadeOut {
      animation: fadeOut 3s ease-out forwards;
    }
  }

  .msg-view {
    position: relative;
    width: 100%;
    height: calc(100% - 114px);
    padding: 3% 5%;
    background-color: #f3f3f3;
    overflow: auto;
  }

  .msg-box {
    width: 100%;
    margin-bottom: 5%;
    overflow: hidden;
  }

  .in-out-tip {
    color: #999;
    text-align: center;
  }

  .msg-nickname {
    margin-bottom: 1%;
    color: #666;
  }

  .image {
    max-width: 40%;
    max-height: 30vh; // 百分比用不成,根据 w3c specs: 父元素需要指定固定高度

    &.pending {
      opacity: .5;
    }
  }

  .msg-content {
    display: inline-block;
    max-width: 80%;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 1.15em;
    word-break: break-all;
    color: #000;
    background-color: #fff;

    &.success {
      background-color: #00e676;
    }

    &.failed {
      background-color: #ef5350;
    }

    &.pending {
      background-color: #fff176;
    }
  }

  .msg-recevied {
    animation-duration: .2s;
    animation-iteration-count: 1;
  }

  .msg-sent {
    animation-duration: .2s;
    animation-iteration-count: 1;

    .msg-nickname {
      text-align: right;
    }

    .msg-content {
      float: right;
    }

    .image {
      float: right;
    }
  }

  .footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 64px;
    background-color: #f7f7f7;

    .msg-input {
      width: 85%;
      padding-left: 6%;
      margin: 0;
    }

    .msg-send-btn {
      width: 15%;
    }
  }
}
</style>