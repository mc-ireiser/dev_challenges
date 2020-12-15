import lscache from "lscache";
import router from "../router/index";

export default function unauthorized() {
	lscache.remove("token");
	router.replace("registry");
}
