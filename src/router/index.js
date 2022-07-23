import Vue from 'vue'
import Router from 'vue-router'

const Login = () => import(/*webpackChunckName:"Login_Home_Welcome"*/'../components/Login.vue')
const Home = () => import(/*webpackChunckName:"Login_Home_Welcome"*/'../components/Home.vue')
const Welcome = () => import(/*webpackChunckName:"Login_Home_Welcome"*/'../components/Welcome.vue')

const Users = () => import(/*webpackChunckName:"Users_Rights_Roles"*/'../components/Users/Users.vue')
const Rights = () => import(/*webpackChunckName:"Users_Rights_Roles"*/'../components/Power/Rights.vue')
const Roles = () => import(/*webpackChunckName:"Users_Rights_Roles"*/'../components/Power/Roles.vue')

const Cate = () => import(/*webpackChunckName:"Cate_Params"*/'../components/Goods/Cate.vue')
const Params = () => import(/*webpackChunckName:"Cate_Params"*/'../components/Goods/Params.vue')

const List = () => import(/*webpackChunckName:"List_Add"*/'../components/Goods/List.vue')
const Add = () => import(/*webpackChunckName:"List_Add"*/'../components/Goods/Add.vue')

const Order = () => import(/*webpackChunckName:"Order_Report"*/'../components/Order/Order.vue')
const Report = () => import(/*webpackChunckName:"Order_Report"*/'../components/Report/Report.vue')

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      //子路由规则，welcome 在 home 页面下，因此子路由规则放入 children 数组中
      path: '/home', component: Home,
      //重定向形式，只要路由访问了 home 地址，就重定向到 welcome 子路由规则
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params },
        { path: '/goods', component: List },
        { path: '/goods/add', component: Add },
        { path: '/orders', component: Order },
        { path: '/reports', component: Report }
      ]
    }
  ]
})

//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  //to 将要访问的路径
  //from 代表从哪个路径跳转而来
  //next 是一个函数，表示放行
  // next()  放行    next('/login)    强制跳转

  if (to.path === '/login') return next()
  //获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
