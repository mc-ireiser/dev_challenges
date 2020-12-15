<template>
	<div class="notification">
		<button @click="resetdb()" class="button is-danger">
			Delete db
		</button>
	</div>
</template>

<script>
import http from "../service/api";
import * as bulmaToast from "bulma-toast";

export default {
	props: {
		socket: {
			required: true
		}
	},

	methods: {
		async resetdb() {
			const response = await http.get(`/reset`);
			const message = response.data.message;

			if (response.ok) {
				bulmaToast.toast({ message, type: "is-primary", duration: 5000 });

				const data = await JSON.stringify({
					event: "reset:db"
				});

				this.socket.send(data);
			} else {
				bulmaToast.toast({ message, type: "is-danger", duration: 5000 });
			}
		}
	}
};
</script>
