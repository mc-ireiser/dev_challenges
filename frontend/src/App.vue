<template>
	<div id="app">
		<router-view />
	</div>
</template>

<script>
import lscache from "lscache";

export default {
	async mounted() {
		const userName = await lscache.get("userName");
		if (!userName) {
			this.$router.replace("registry", () => {});
		} else {
			this.$router.replace("dashboard", () => {});
		}
	}
};
</script>
