import lscache from "lscache";
import router from "../router/index";

export default function unauthorized() {
	lscache.remove("userName");
	router.replace("registry");
}
