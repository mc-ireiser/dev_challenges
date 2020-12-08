<template>
	<section class="hero is-light is-fullheight">
		<div class="hero-body">
			<div class="container has-text-centered">
				<div class="columns">
					<div class="column is-1"></div>
					<div class="column">
						<h1 class="title is-2 mb-6">Planning Poker</h1>
						<h2 class="title is-4">Workana Hiring Challenge</h2>
						<div class="columns">
							<div class="column"></div>
							<div class="column is-half">
								<div class="field  mt-2">
									<div class="control">
										<input
											v-model="name"
											class="input"
											type="text"
											autocomplete="none"
											placeholder="What is your name? - required"
										/>
									</div>
									<div class="control mt-4">
										<button
											@click="registerUser()"
											:class="{
												'is-loading': loading
											}"
											class="button is-primary is-fullwidth has-text-weight-bold"
											:disabled="!name || loading"
										>
											Get in
										</button>
									</div>
								</div>
							</div>
							<div class="column"></div>
						</div>
					</div>
					<div class="column is-1"></div>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
import http from "../service/api";
import lscache from "lscache";
import * as bulmaToast from "bulma-toast";

export default {
	data() {
		return {
			name: "",
			loading: false
		};
	},

	computed: {
		storedName() {
			return lscache.get("userName");
		},
		storedToken() {
			return lscache.get("token");
		}
	},

	methods: {
		async registerUser() {
			this.loading = true;
			const response = await http.post("/user", { name: this.name });

			if (response.ok) {
				const data = response.data;

				lscache.set("userName", data.name, 3600000);
				lscache.set("token", data.token, 3600000);

				http.setHeaders({
					token: data.token
				});

				bulmaToast.toast({ message: `Hi, ${data.name}`, type: "is-primary" });

				this.$router.push("dashboard");
			} else {
				const message = response.data.message;

				bulmaToast.toast({ message, type: "is-danger" });
			}

			this.loading = false;
		}
	}
};
</script>

<style></style>
