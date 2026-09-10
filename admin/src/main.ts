import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import * as Icons from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';

// 全局样式（苗韵国风主题 + 工具类 + 动画）
import './styles/index.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(ElementPlus);
for (const [name, comp] of Object.entries(Icons)) {
  app.component(name, comp as any);
}
app.mount('#app');