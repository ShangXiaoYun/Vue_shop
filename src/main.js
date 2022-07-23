// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
// 导入组件库
// import ElementUI from 'element-ui'
// import SophieUI from 'sophie-ui'
// import MeowsUI from 'meows-ui'
// 导入组件相关样式
// import 'element-ui/lib/theme-chalk/index.css'
// import 'sophie-ui/lib/sophie-ui.css'

// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'

import TreeTable from 'vue-table-with-tree-grid'
//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入富文本编辑器对应的样式
// import 'quill/dist/quill.core.css' // import styles
// import 'quill/dist/quill.snow.css' // for snow theme
// import 'quill/dist/quill.bubble.css' // for bubble theme

//导入 NProgress 包对应的JS和 css
import NProgress from 'nprogress'
// import 'nprogress/nprogress.css'

import VueLazyLoad from 'vue-lazyload'

import elTableInfiniteScroll from 'el-table-infinite-scroll';
Vue.use(elTableInfiniteScroll);

import axios from 'axios'
//配置请求根路径
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'

//在request拦截器中，展示进度条  NProgress.start()
//axios请求拦截
axios.interceptors.request.use(config => {
  NProgress.start()
  //为请求头对象，添加Token 验证的Authorization字段
  console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  //在最后必须返回预处理结果 return config
  return config
})
//在 request 拦截器中隐藏进度条  NProgress.dones()
axios.interceptors.response.use(config => {
  NProgress.done()
  return config;
})
Vue.prototype.$http = axios
// Vue.prototype.$echarts = echarts

// 配置 Vue 插件
// Vue.use(ElementUI)
// Vue.use(SophieUI)
Vue.config.productionTip = false

// Vue.use(TreeTable)
//注册为全局可用组件(手动注册：后面是注册的插件，前面是名称)
Vue.component('tree-table', TreeTable)
//将富文本编辑器，注册为全局可用的组件
Vue.use(VueQuillEditor)


const loadimage = require('./assets/loading.gif')
const errorimage = require('./assets/error.jpg')
//使用懒加载的插件
Vue.use(VueLazyLoad,{
  error: errorimage,
  loading: loadimage
})

//注册全局过滤器，第一个参数是过滤器的名字，function函数是过滤器的处理函数
//全局格式化时间过滤器
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal * 1000)  //单位为毫秒
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
