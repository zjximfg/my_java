import Vue from 'vue'
import App from './App.vue'
import './plugins/iview.js'
import router from './router'
import LayoutArticle from './components/Layout-article'
import store from './store'

Vue.config.productionTip = false;
Vue.component('Layout-article', LayoutArticle);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
