import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";
import router from "./router";
import { loadSetting } from "@/utils/settingutils";
loadSetting();
// 解决 ElTable 自动宽度高度导致的「ResizeObserver loop limit exceeded」问题
const app = createApp(App);
app.use(router);
app.use(ElementPlus);
app.mount("#app");
