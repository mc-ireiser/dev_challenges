<template>
	<section class="hero is-light is-fullheight">
		<div class="hero-body">
			<div class="container has-text-centered">
				<div class="columns">
					<div class="column is-1"></div>
					<div class="column">
						<h1 class="title is-2 mb-4">Planning Poker</h1>
						<h2 class="title is-4 mb-5">Workana Hiring Challenge</h2>
						<div class="columns">
							<div class="column"></div>
							<div class="column is-half">
								<div class="field  mt-2">
									<div class="control">
										<div>
											<label class="label mt-5 has-text-left">Username</label>
											<input
												v-model="userName"
												class="input"
												type="text"
												autocomplete="none"
												placeholder="Set up a username"
											/>
										</div>
										<div v-if="!register" class="mt-4">
											<label class="label has-text-left">Name</label>
											<input
												v-model="name"
												class="input"
												type="text"
												autocomplete="none"
												placeholder="What is your name?"
											/>
										</div>
									</div>
									<div class="control mt-5">
										<button
											v-if="register"
											@click="loginUser()"
											:class="{
												'is-loading': loading
											}"
											class="button is-primary is-fullwidth has-text-weight-bold"
											:disabled="!userName || loading"
										>
											Login
										</button>
										<button
											v-else
											@click="registerUser()"
											:class="{
												'is-loading': loading
											}"
											class="button is-primary is-fullwidth has-text-weight-bold"
											:disabled="!name || !userName || loading"
										>
											Sign in
										</button>
									</div>
									<div class="control mt-5">
										<p
											v-if="register"
											@click="register = !register"
											class="is-clickable"
										>
											Register new user
										</p>
										<p
											v-else
											@click="register = !register"
											class="is-clickable"
										>
											Login
										</p>
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
import { v4 as uuidv4 } from "uuid";
import * as bulmaToast from "bulma-toast";

export default {
	data() {
		return {
			name: "",
			userName: "",
			loading: false,
			register: true
		};
	},

	methods: {
		async loginUser() {
			this.loading = true;
			const response = await http.post("/user/login", {
				userName: this.userName
			});

			this.processResponse(response);
		},

		async registerUser() {
			this.loading = true;
			const response = await http.post("/user", {
				name: this.name,
				userName: this.userName
			});

			this.processResponse(response);
		},

		async processResponse(response) {
			if (response.ok) {
				const data = response.data;
				const userName = this.register ? this.userName : data.userName;
				const reference = uuidv4();

				lscache.set("user_name", data.name, 3600000);
				lscache.set("userName", userName, 3600000);
				lscache.set("reference", reference, 3600000);

				http.setHeaders({
					userName
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
