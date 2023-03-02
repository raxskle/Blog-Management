import {
  createRouter,
  createWebHistory,
} from "vue-router";

import AdminPage from "../pages/AdminPage.vue";
import LoginPage from "../pages/LoginPage.vue";
import NotFound from "../components/NotFound.vue";

const routes = [
  { path: "/blogadmin", redirect:"/blogadmin/raxskle/youmuren/login" },
  { path: "/blogadmin/raxskle/youmuren/login", component: LoginPage, name: "login" },
  {
    path: "/blogadmin/admin",
    component: AdminPage,
    name: "admin",
  },
  { path: "/blogadmin/:path(.*)", component: NotFound }, // 匹配任意的路由
];

const router = createRouter({
  history: createWebHistory(), //历史模式在后端服务器路由要写一个非匹配任何资源就返回index主页
  routes, // short for `routes: routes`
});

export default router;
