import Vue from "vue"
import VueRouter from "vue-router"
import Login from "../components/login/login"
import Home from '../components/Home'
import Welcome from "../components/Welcome";
import Users from "../components/users/Users";
import Roles from "../components/power/Roles";
import Rights from "../components/power/Rights";
import Categories from "../components/goods/Categories";
import Params from "../components/goods/Params";
import GoodsList from '../components/goods/List';
import AddGoods from "../components/goods/AddGoods";
import Order from "../components/order/Order";
import Report from "../components/report/Report";

Vue.use(VueRouter)

const routes = [
    {path: '/', redirect: '/login'},
    {path: '/login',name: 'login', component: Login},
    {path: '/home', component: Home, redirect: '/welcome',
        children: [
            {path: '/welcome', component: Welcome},
            {path: '/users', component: Users},
            {path: '/rights', component: Rights},
            {path: '/roles', component: Roles},
            {path: '/categories', component: Categories},
            {path: '/params', component: Params},
            {path: '/goods', component: GoodsList},
            {path: '/goods/add', component: AddGoods},
            {path: '/orders', component: Order},
            {path: '/reports', component: Report},
        ]}
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

//挂载路由守卫
router.beforeEach((to, from, next) => {
   /*
   * to 将要访问的页面
   * from 从哪个页面而来
   * next 函数放行， next()直接放行， next('/login') 强制跳转
   * */
   //登录页面不需要权限
   if(to.path == '/login') return next();
   //如果不是登录页，则需要判断是否经过登录
   const toekenStr = window.sessionStorage.getItem('token');
   if (!toekenStr) return next("/login");
   next();
});

export default router