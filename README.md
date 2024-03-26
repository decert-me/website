# DeCert.me
<p align="center">
  <img src="./public/favicon.ico" width="200" alt="DeCert.me logo">
</p>

## 🚀 DeCert.me frontend

### 技术栈

`React@18.2.0 + React-Router@6.14.2 + Antd@5.8.2 + Wagmi@1.4.6 + Viem@1.19.1`

> `Create React App`    脚手架工具快速搭建项目结构

<!-- ### 基本功能

- [x] NFT展示 -->

### 项目结构

```
├── public                   # 不参与编译的资源文件
├── src                      # 主程序目录
│   ├── request                     # axios 封装
│   ├── assets                  # 资源文件
│   │   ├── images        # 图片资源
│   │   ├── locales        # 国际化文案
│   │   └── styles                  # 样式文件
│   ├── components              # 全局公共组件
│   ├── hooks             # 自定义钩子
│   │   ├── useAccountInit        # 钱包连接初始化
│   │   ├── useAddress        # 钱包地址初始化
│   │   ├── useMonacoInit        # monaco编辑器初始化
│   │   ├── usePublish        # 发布挑战
│   │   ├── usePublishCollection        # 发布合集
│   │   └── useVerifyToken         # 校验token
│   ├── provider                   # react context
│   ├── redux                   # react-redux
│   ├── router                   # 路由配置
│   ├── state                   # react-query 状态数据请求
│   ├── utils                   # 方法
│   ├── views                   # UI 页面
│   │   ├── Challenge        # 挑战页
│   │   ├── Claim        # 领取认证页
│   │   ├── Collection        # 合集详情页
│   │   ├── Index        # 首页
│   │   ├── Preview        # 挑战详情预览页
│   │   ├── Publish        # 发布挑战页
│   │   ├── Publish        # 发布挑战页
│   │   ├── Question        # 挑战详情页
│   │   ├── Rating        # 发题人评分页
│   │   ├── User        # 个人中心
│   │   ├── Callback        # 第三方绑定回调页
│   │   ├── Cert        # 认证页
│   │   ├── Explore        # 挑战列表页
│   │   ├── Lesson        # 教程列表页
│   │   ├── NotFound        # 错误页
│   │   └── Search         # 认证搜索页
│   ├── APP.js                  # App.js
│   └── index.js                # index.js
```

### 配置参数

添加配置文件到`./env.development`(`./env.production` 用于打包)，将'xxx'替换为设定值。更多默认配置见 [env-example](./env-example)
```
REACT_APP_IS_DEV=true

# 后端 API url
REACT_APP_BASE_URL="https://api.decert.me"     

# NFT 索引 API url
REACT_APP_NFT_BASE_URL="https://cert.decert.me"

# 挑战内容加密密钥
REACT_APP_ANSWERS_KEY=xxx   

# particle配置 详情见：https://docs.particle.network/developers/auth-service/sdks/web#step-2-setup-developer-api-key
REACT_APP_PARTICLE_PROJECT_ID=xxx    //  particle PROJECT_ID值
REACT_APP_PARTICLE_CLIENT_KEY=xxx    //  particle CLIENT_KEY值
REACT_APP_PARTICLE_APP_ID=xxx    //  particle APP_ID值

```

### 使用方法

```npm

// 安装依赖
yarn

// 启动
yarn start

// 打包
yarn build

```
