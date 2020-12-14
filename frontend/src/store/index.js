import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

import { issueState } from "./modules/issue";
import { voteState } from "./modules/vote";

const store = new Vuex.Store({
	modules: {
		issueState,
		voteState
	}
});

export default store;
