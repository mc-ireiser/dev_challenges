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
				<!-- Votes -->
				<div class="column is-half is-text-centered">
					<h2 class="title">Voting board</h2>
					<div class="notification">
						<h3 class="subtitle has-text-weight-bold">Points</h3>
						<!-- Votes values -->
						<div class="tags">
							<span
								v-for="vote in validVotes"
								:key="vote"
								@click="
									issue.status !== 'reveal' && issue.status !== 'passed'
										? (selectedVote = vote)
										: (selectedVote = youOnIssue.value)
								"
								:class="{
									'is-light': vote != selectedVote
								}"
								class="tag is-large is-clickable is-primary has-text-weight-bold m-2 p-4"
							>
								{{ vote }}
							</span>
						</div>
						<!-- Vote issue -->
						<button
							@click="voteIssue()"
							class="button is-primary m-2 has-text-weight-bold"
							:disabled="
								issue.status === 'reveal' ||
									youOnIssue.status === 'vote' ||
									youOnIssue.status === 'passed' ||
									!selectedVote ||
									!selectedIssue
							"
						>
							Vote the issue {{ selectedIssue }}
						</button>
						<!-- Join issue -->
						<div class="level my-6">
							<div class="level-left">
								<div class="level-item">
									<h2 class="subtitle has-text-weight-bold">Members</h2>
								</div>
							</div>
							<div class="level-right">
								<div class="level-item">
									<button
										@click="joinIssue()"
										class="button is-fullwidth is-warning has-text-weight-bold"
										:disabled="isJoined || !selectedIssue"
									>
										Join the issue {{ selectedIssue }}
									</button>
								</div>
							</div>
						</div>
						<!-- Issue members -->
						<div>
							<div
								v-for="member in issue.members"
								:key="member.id"
								class="notification is-warning"
							>
								<div class="level">
									<div class="level-left">
										<div class="level-item">
											<p class="has-text-weight-bold">
												{{ member.name }}
											</p>
										</div>
									</div>
									<div class="level-right">
										<div class="level-item">
											<p class="has-text-weight-bold">{{ member.status }}</p>
										</div>
										<div class="level-item">
											<p class="has-text-weight-bold">
												{{
													member.value && youOnIssue.value ? member.value : "?"
												}}
											</p>
										</div>
									</div>
								</div>
							</div>
							<div
								v-if="issue.status === 'reveal'"
								class="notification is-success"
							>
								<div class="level">
									<div class="level-left">
										<div class="level-item">
											<p class="has-text-weight-bold">
												Avg
											</p>
										</div>
									</div>
									<div class="level-right">
										<div class="level-item">
											<p class="has-text-weight-bold">
												{{
													issue.avg && youOnIssue.value
														? parseFloat(issue.avg).toFixed(2)
														: "?"
												}}
											</p>
										</div>
									</div>
								</div>
							</div>
							<transition>
								<progress
									v-show="loadigIssue"
									class="progress is-small is-warning"
									max="100"
									>15%</progress
								>
							</transition>
						</div>
					</div>
				</div>
				<!-- Issues -->
				<div class="column">
					<h2 class="title">Issues</h2>
					<div class="notification">
						<div class="level mt-2 mb-5">
							<div class="level-left">
								<div class="level-item">
									<h2 class="subtitle has-text-weight-bold">Number</h2>
								</div>
							</div>
							<div class="level-right">
								<div class="level-item">
									<button
										@click="activeCreateIssueModal = !activeCreateIssueModal"
										class="button is-fullwidth is-info has-text-weight-bold"
									>
										Create issue
									</button>
								</div>
							</div>
						</div>
						<!-- Issues List -->
						<div class="tags mb-4">
							<span
								v-for="issue in issues"
								:key="issue"
								@click="
									selectedIssue = issue;
									getIssue();
								"
								:class="{
									'is-light': issue != selectedIssue
								}"
								class="tag is-clickable is-large is-info has-text-weight-bold m-2 p-4"
							>
								{{ issue }}
							</span>
						</div>
						<transition>
							<progress
								v-show="loadigIssues"
								class="progress is-small is-info"
								max="100"
								>15%</progress
							>
						</transition>
					</div>
					<!-- Reset db -->
					<div>
						<h2 class="subtitle has-text-weight-bold">Delete db</h2>
						<div class="notification">
							<button @click="resetdb()" class="button is-danger">
								Delete db
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- Modal -->
		<div class="modal" :class="{ 'is-active': activeCreateIssueModal }">
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
						@click="activeCreateIssueModal = !activeCreateIssueModal"
						class="button is-danger"
					>
						Cancel
					</button>
				</footer>
			</div>
		</div>
	</section>
</template>

<script>
import http from "../service/api";
import lscache from "lscache";
import * as bulmaToast from "bulma-toast";

const socket = new WebSocket("ws://localhost:8082");

export default {
	data() {
		return {
			selectedVote: null,
			validVotes: [1, 2, 3, 5, 8, 13, 20, 40, "?"],

			issue: { members: [] },
			issues: [],
			newIssue: null,
			selectedIssue: null,

			loadigIssue: false,
			loadigIssues: false,

			activeCreateIssueModal: false
		};
	},

	computed: {
		storedName() {
			return lscache.get("userName");
		},

		storedToken() {
			return lscache.get("token");
		},

		youOnIssue() {
			return (
				this.issue.members.filter(element => {
					return element.id === this.storedToken;
				})[0] || []
			);
		},

		issueMembersId() {
			return (
				this.issue.members.map(element => {
					return element.id;
				}) || []
			);
		},

		isJoined() {
			return this.issueMembersId.some(element => element === this.storedToken);
		}
	},

	mounted() {
		this.wsS();
		this.getIssues();
	},

	methods: {
		logout() {
			lscache.flush();
			location.reload();
		},

		async getIssues() {
			this.loadigIssues = true;
			const response = await http.get("/issue/all");
			this.loadigIssues = false;

			if (response.ok) {
				this.issues = response.data.issues;
			} else {
				console.error(response.data.message);
			}
		},

		async getIssue() {
			this.loadigIssue = true;
			const response = await http.get(`/issue/${this.selectedIssue}`);
			this.loadigIssue = false;

			if (response.ok) {
				this.issue = response.data.issue;
				this.selectedVote = this.youOnIssue.value || null;
			} else {
				console.error(response.data.message);
			}
		},

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
				this.getIssues();
				this.newIssue = null;
				this.activeCreateIssueModal = false;
				bulmaToast.toast({ message, type: "is-primary", duration: 5000 });

				const data = await JSON.stringify({
					event: "create:issue",
					name: this.storedName
				});

				socket.send(data);
			} else {
				if (response.status === 401) {
					this.unauthorized();
				}

				bulmaToast.toast({ message, type: "is-danger", duration: 5000 });
			}
		},

		async joinIssue() {
			const token = this.storedToken;
			const name = this.storedName;

			const response = await http.post(
				`/issue/${this.selectedIssue}/join`,
				{ name },
				{ headers: { token } }
			);

			const message = response.data.message;

			if (response.ok) {
				this.getIssue();
				bulmaToast.toast({ message, type: "is-primary", duration: 5000 });

				const data = await JSON.stringify({
					event: "join:issue",
					name: this.storedName,
					issue: this.selectedIssue,
					token
				});

				socket.send(data);
			} else {
				if (response.status === 401) {
					this.unauthorized();
				}

				bulmaToast.toast({ message, type: "is-danger", duration: 5000 });
			}
		},

		async voteIssue() {
			const token = this.storedToken;
			const value = this.selectedVote;

			const response = await http.post(
				`/issue/${this.selectedIssue}/vote`,
				{ value },
				{ headers: { token } }
			);

			const message = response.data.message;

			if (response.ok) {
				this.getIssue();
				bulmaToast.toast({ message, type: "is-primary", duration: 5000 });

				const data = await JSON.stringify({
					event: "vote:issue",
					name: this.storedName,
					issue: this.selectedIssue,
					token
				});

				socket.send(data);
			} else {
				if (response.status === 401) {
					this.unauthorized();
				}

				bulmaToast.toast({ message, type: "is-danger", duration: 5000 });
			}
		},

		unauthorized() {
			lscache.remove("token");
			this.$router.replace("registry");
		},

		async resetdb() {
			const response = await http.get(`/reset`);
			const message = response.data.message;

			if (response.ok) {
				bulmaToast.toast({ message, type: "is-primary", duration: 5000 });

				const data = await JSON.stringify({
					event: "reset:db"
				});

				socket.send(data);
			} else {
				bulmaToast.toast({ message, type: "is-danger", duration: 5000 });
			}
		},

		async wsS() {
			const self = this;
			const data = await JSON.stringify({
				event: "conection",
				name: this.storedName
			});

			// Connection opened
			socket.addEventListener("open", function() {
				socket.send(data);
			});

			// Listen for messages
			socket.addEventListener("message", async function(event) {
				const response = await JSON.parse(event.data);

				if (response.event === "create:issue") {
					self.getIssues();
				}

				if (response.event === "join:issue") {
					if (response.token !== self.storedToken) {
						const message = `${response.name} has joined joined the issue ${response.issue}`;
						bulmaToast.toast({ message, type: "is-primary", duration: 5000 });
					}

					if (response.issue === self.selectedIssue) {
						self.getIssue();
					}
				}

				if (response.event === "vote:issue") {
					if (response.token !== self.storedToken) {
						const message = `${response.name} has voted on the issue ${response.issue}`;
						bulmaToast.toast({ message, type: "is-primary", duration: 5000 });
					}

					if (response.issue === self.selectedIssue) {
						self.getIssue();
					}
				}

				if (response.event === "reset:db") {
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

<style lang="scss" scoped></style>
