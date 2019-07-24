# Minichat
一个基于 [Socket.IO](https://socket.io/) 和 *localStorage* 的超小型、小流量的移动端实时单房聊天室，支持发送文字或图片。该项目的服务器端是 [Minichat-server](https://github.com/xpfxzxc/Minichat-server)，其性能较差。

## 在线 Demo
地址：[Minichat](https://xpfxzxc.github.io/Minichat/)  
*注意： 可能由于服务器问题，用户空闲时将自动断线，尤其是移动端；发送（大）图片时容易造成网络拥塞。*

## 运行截图
![minichat-demo](https://user-images.githubusercontent.com/44606206/61767213-1ec12a00-ae16-11e9-9ecd-abb5ce64d139.gif)

## 功能介绍
- [ ] 多个房间
- [x] 公共房间
- [x] localstorage 存储昵称
- [x] 自动登录
- [x] 断线重连
- [x] 「进入/离开房间」提示
- [x] 自动滚动至底部机制
- [x] 文字聊天
- [x] 图片聊天
- [x] 图片放大器
- [x] 连接状态提示
- [x] 房间联系人列表
- [x] 联系人搜索
- [ ] 房间列表
- [ ] 房间创建、删除
- [ ] 私有房间
- [ ] 一对一房间
- [ ] 远程登录
- [ ] 用户头像
- [ ] 日期提示
- [ ] 「对方正在输入」提示
- [ ] 语音输入
- [ ] 表情栏
- [ ] 消息提醒
- [ ] 聊天历史记录
- [ ] 手势操作

## 安装
```npm install```

## 使用方法
### 本地部署
1. 运行 [Minichat-server](https://github.com/xpfxzxc/Minichat-server)。
2. 在本项目的根目录下运行命令```npm run serve```。
3. 用浏览器打开 ```http://localhost:8080/```。

### 生产构建
1. 查看根目录下 ```src``` 目录下的 ```main.js``` 这段代码：
```javascript
Vue.prototype.$socket = io(
  process.env.NODE_ENV === 'development' ? 'http://localhost:60300/' : 'https://minichat777.herokuapp.com/',
  { secure:true, autoConnect: false }
)
```
2. 根据部署地址，修改上面代码的第二行。如果不使用 SSL，需将选项  ```secure``` 修改为 ```false```。  
3. 在本项目根目录下运行 ```npm run build``` 进行生产构建。
