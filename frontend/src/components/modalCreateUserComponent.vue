<template>
	<div class="modal" :class="{ 'is-active': activateCreateIssueModal }">
		<div class="modal-background"></div>
		<div class="modal-card">
			<header class="modal-card-head">
				<p class="modal-card-title">Create a new issue</p>
			</header>
			<section class="modal-card-body">
				<div class="field">
					<label class="label">Issue number</label>
					<div class="control">
						<input
							v-model="newIssue"
							class="input"
							type="number"
							placeholder="1"
							required
						/>
					</div>
				</div>
			</section>
			<footer class="modal-card-foot">
				<button
					@click="createIssue()"
					class="button is-info"
					:disabled="!newIssue"
				>
					Save
				</button>
				<button
					@click="changeCreateIssueModalStatus()"
					class="button is-danger"
				>
					Cancel
				</button>
			</footer>
		</div>
	</div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import http from "../service/api";
import lscache from "lscache";
import * as bulmaToast from "bulma-toast";
import unauthorized from "../helpers/unauthorized";

export default {
	props: {
		socket: {
			required: true
		}
	},

	data() {
		return {
			newIssue: null
		};
	},

	computed: {
		...mapState({
			activateCreateIssueModal: state =>
				state.issueState.activateCreateIssueModal
		}),

		storedName() {
			return lscache.get("userName");
		},

		storedToken() {
			return lscache.get("token");
		}
	},

	methods: {
		...mapMutations({
			changeCreateIssueModalStatus: "issueState/changeCreateIssueModalStatus"
		}),

		async createIssue() {
			const token = this.storedToken;
			const name = this.storedName;

			const response = await http.post(
				`/issue/${this.newIssue}/join`,
				{ name },
				{ headers: { token } }
			);

			const message = response.data.message;

			if (response.ok) {
				this.$emit("getIssues");
				this.newIssue = null;
				bulmaToast.toast({ message, type: "is-primary", duration: 5000 });

				const data = await JSON.stringify({
					event: "create:issue",
					name: this.storedName
				});

				this.socket.send(data);
			} else {
				if (response.status === 401) {
					unauthorized();
				}

				bulmaToast.toast({ message, type: "is-danger", duration: 5000 });
			}
		}
	}
};
</script>

<style lang="scss" scoped></style>
