import Vue from "vue";
import App from "./App.vue";
// import ui from "../packages";
import Element from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

Vue.config.productionTip = false;

// Vue.use(ui);
Vue.use(Element);
new Vue({
  render: (h) => h(App),
}).$mount("#app");
