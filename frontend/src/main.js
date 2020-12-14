import Vue from "vue";
import router from "./router";
import App from "./App.vue";

import store from "./store/index";
import "../node_modules/bulma/css/bulma.css";

Vue.config.productionTip = false;

new Vue({
	router,
	store,
	render: h => h(App)
}).$mount("#app");
