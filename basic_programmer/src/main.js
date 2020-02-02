import Vue from 'vue';
import App from './App.vue';
import router from './router/router';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/css/reset.css';
import './assets/fonts/iconfont.css';

import MyHttpServer from "./plugins/http";
//富文本编辑器的使用
import VueQuillEditor from 'vue-quill-editor'
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.use(ElementUI);
Vue.use(MyHttpServer);

Vue.config.productionTip = false;


Vue.use(VueQuillEditor)

//定义全局事件管道
Vue.filter('dateFormat', function (originValue) {
  const dt = new Date(originValue);
  const y = dt.getFullYear();
  const m = (dt.getMonth() + 1 + '').padStart(2, '0');
  const d = (dt.getDate() + '').padStart(2, '0');

  const hh = (dt.getHours() + '').padStart(2, '0');
  const mm = (dt.getMinutes() + '').padStart(2, '0');
  const ss = (dt.getSeconds() + '').padStart(2, '0');

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
});

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
