<template>
	<section class="hero is-white is-fullheight">
		<div class="container is-fluid mt-6">
			<nav class="level">
				<!-- Left side -->
				<div class="level-left">
					<div class="level-item">
						<h1 class="title is-5">The Planning Poker Lobby</h1>
					</div>
				</div>
				<!-- Right side -->
				<div class="level-right">
					<div class="level-item">
						<h2 class="subtitle mr-5">{{ storedName }}</h2>
						<button
							@click="logout()"
							class="button is-danger is-small is-outlined"
						>
							Log out
						</button>
					</div>
				</div>
			</nav>
			<div class="columns mt-4">
				<div class="column is-half is-text-centered">
					<!-- Votes -->
					<h2 class="title">Voting board</h2>
					<vote-component ref="voteComponet" :socket="socket"></vote-component>
				</div>
				<div class="column">
					<!-- Issues -->
					<h2 class="title">Issues</h2>
					<issues-component
						ref="issuesComponet"
						@getIssue="getIssue()"
					></issues-component>
					<!-- Reset db -->
					<h2 class="subtitle has-text-weight-bold mt-5">Delete db</h2>
					<reset-db-componet :socket="socket"></reset-db-componet>
				</div>
			</div>
		</div>
		<!-- Modal -->
		<modal-create-user-component
			@get-issues="getIssues()"
			:socket="socket"
		></modal-create-user-component>
	</section>
</template>

<script>
import { mapState } from "vuex";
import lscache from "lscache";
import * as bulmaToast from "bulma-toast";

import issuesComponent from "../components/issuesComponet";
import voteComponent from "../components/voteComponent";
import resetDbComponet from "../components/resetDbComponet";
import modalCreateUserComponent from "../components/modalCreateUserComponent";

const socket = new WebSocket("ws://localhost:8082");

export default {
	data() {
		return {
			socket
		};
	},

	components: {
		issuesComponent,
		voteComponent,
		resetDbComponet,
		modalCreateUserComponent
	},

	computed: {
		...mapState({
			activateCreateIssueModal: state =>
				state.issueState.activateCreateIssueModal,
			issues: state => state.issueState.issues,
			issue: state => state.issueState.issue,
			selectedIssue: state => state.issueState.selectedIssue
		}),

		storedName() {
			return lscache.get("user_name");
		}
	},

	mounted() {
		this.wsS();
	},

	methods: {
		getIssue() {
			this.$refs.voteComponet.getIssue();
		},

		getIssues() {
			this.$refs.issuesComponet.getIssues();
		},

		logout() {
			lscache.flush();
			location.reload();
		},

		async wsS() {
			const self = this;
			const data = JSON.stringify({
				event: "conection",
				name: this.storedName
			});

			// Connection opened
			socket.addEventListener("open", function() {
				socket.send(data);
			});

			// Listen for messages
			socket.addEventListener("message", async function(event) {
				const response = JSON.parse(event.data);

				if (response.event === "create:issue") {
					self.getIssues();
				}

				if (response.event === "join:issue") {
					if (response.name !== self.storedName) {
						const message = `${response.name} has joined joined the issue ${response.issue}`;
						bulmaToast.toast({ message, type: "is-primary", duration: 5000 });
					}

					if (response.issue === self.selectedIssue) {
						self.getIssue();
					}
				}

				if (response.event === "vote:issue") {
					if (response.name !== self.storedName) {
						const message = `${response.name} has voted on the issue ${response.issue}`;
						bulmaToast.toast({ message, type: "is-primary", duration: 5000 });
					}

					if (response.issue === self.selectedIssue) {
						self.getIssue();
					}
				}

				if (response.event === "reset:db") {
					lscache.remove("userName");
					location.reload();
				}
			});

			// Handle errors
			socket.addEventListener("error", function(event) {
				console.log("WebSocket error observed:", event);
			});
		}
	}
};
</script>
