import { createRouter, createWebHistory } from "vue-router";

export const routes = [
  {
    path: "/",
    name: "主页",
    index: "1",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/HomeView.vue"),
  },
  {
    path: "/setting",
    name: "设置",
    index: "2",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/SettingView.vue"),
  },
  {
    path: "/gamble",
    name: "抽卡记录",
    index: "3",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/GambleView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
