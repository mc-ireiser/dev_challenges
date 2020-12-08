import Vue from "vue";
import VueRouter from "vue-router";
import App from "../App.vue";
import Dashboard from "../views/Dashboard.vue";
import Registry from "../views/Registry.vue";
import About from "../views/About.vue";

Vue.use(VueRouter);

const routes = [
	{
		path: "/",
		name: "app",
		component: App
	},
	{
		path: "/dashboard",
		name: "dashboard",
		component: Dashboard
	},
	{
		path: "/registry",
		name: "registry",
		component: Registry
	},
	{
		path: "/about",
		name: "about",
		component: About
	}
];

const router = new VueRouter({
	routes
});

export default router;
