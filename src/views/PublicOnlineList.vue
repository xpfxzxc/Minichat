<template>
  <div class="online-list">
    <mu-flex class="header" justify-content="around" align-items="center">
      <mu-button class="back-btn" color="info" icon @click="$router.back()">
        <mu-icon value="arrow_back"></mu-icon>
      </mu-button>
      <mu-text-field class="text-search" v-model="searchText" placeholder="搜索"
        :action-icon="searchText.length ? 'clear' : ''" :action-click="() => searchText = ''">
      </mu-text-field>
    </mu-flex>

    <div class="list-wrapper">
      <mu-list class="list" v-if="filteredNicknameTokenList.length">
        <mu-sub-header>共 {{ filteredNicknameTokenList.length }} {{ searchText.length ? '个搜索结果' : '人目前在线' }}</mu-sub-header>
        <mu-list-item v-for="(nicknameTokens, index) in filteredNicknameTokenList" :key="index"  button :ripple="true">
          <mu-list-item-title>
            <span v-for="(nicknameToken, index) in nicknameTokens" :key="index" :class="{ highlight: index % 2 !== 0 }">{{ nicknameToken }}</span>
          </mu-list-item-title>
          <mu-list-item-action>
            <mu-icon value="chat"></mu-icon>
          </mu-list-item-action>
        </mu-list-item>
      </mu-list>

      <p class="noresult-tip" v-else>没有找到“<span>{{ searchText }}</span>”相关结果</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'publicOnlineList',
  data() {
    return {
      searchText: '',
      nicknameList: []
    }
  },
  computed: {
    // 以关键字为分隔符分割但保留分隔符
    filteredNicknameTokenList() {
      if (this.searchText.length === 0) {
        return this.nicknameList.map(nickname => [nickname])
      }

      return this.nicknameList
              .filter(nickname => nickname.includes(this.searchText))
              .map(nickname => nickname.split(new RegExp(`(${this.searchText})`)))
    }
  },
  created() {
    this.$socket.emit('get public chat online-list', onlineList => {
      this.nicknameList = onlineList

      this.$socket.on('public chat online-list add', nickname => {
        console.log('add')
        this.nicknameList.push(nickname)
      })

      this.$socket.on('public chat online-list delete', nickname => {
        console.log('delete')
        this.nicknameList.splice(this.nicknameList.indexOf(nickname), 1)
      })
    })
  },
  beforeDestroy() {
    this.$socket.removeListener('public chat online-list add')
    this.$socket.removeListener('public chat online-list delete')
  },
  destroyed() {
    console.log('PublicOnlineList 组件销毁')
  }
}
</script>

<style lang="less">
.online-list {
  width: 100%;
  height: 100%;
  background-color: #f3f3f3;

  .header {
    height: 60px;
    background-color: #f7f7f7;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);

    .text-search {
      width: 85%;
      padding-bottom: 0;
      padding-top: 7px;
      padding-right: 5%;
      margin: 0;
    }

    .back-btn {
      width: 14%;
    }
  }

  .list-wrapper {
    position: relative;
    height: calc(100% - 61px);
    margin-top: 1px;
    background-color: #fafafa;
  }

  span.highlight {
    padding: 0 1px;
    color: #ff4081;
    font-weight: bold;
  }

  .noresult-tip {
    position: absolute;
    top: 30%;
    transform: translateY(-50%);
    width: 100%;
    padding: 0 5%;
    text-align: center;
    word-break: break-all;

    span {
      color: #03a9f4;
    }
  }
}
</style>