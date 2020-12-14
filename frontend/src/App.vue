<template>
	<div id="app">
		<router-view />
	</div>
</template>

<script>
import lscache from "lscache";

export default {
	async mounted() {
		const token = await lscache.get("token");
		if (!token) {
			this.$router.replace("registry", () => {});
		} else {
			this.$router.replace("dashboard", () => {});
		}
	}
};
</script>
