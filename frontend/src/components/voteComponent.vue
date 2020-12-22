<template>
	<div>
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
									{{ member.value && youOnIssue.value ? member.value : "?" }}
								</p>
							</div>
						</div>
					</div>
				</div>
				<div v-if="issue.status === 'reveal'" class="notification is-success">
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
						v-show="loadingIssue"
						class="progress is-small is-warning"
						max="100"
						>15%</progress
					>
				</transition>
			</div>
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
			selectedVote: null,
			validVotes: [1, 2, 3, 5, 8, 13, 20, 40, "?"]
		};
	},

	computed: {
		...mapState({
			loadingIssue: state => state.issueState.loadingIssue,
			issue: state => state.issueState.issue,
			selectedIssue: state => state.issueState.selectedIssue
		}),

		storedName() {
			return lscache.get("user_name");
		},

		storedUserName() {
			return lscache.get("userName");
		},

		youOnIssue() {
			return (
				this.issue.members.filter(element => {
					return element.id === this.storedUserName;
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
			return this.issueMembersId.some(
				element => element === this.storedUserName
			);
		},

		reference() {
			return lscache.get("reference");
		}
	},

	methods: {
		...mapMutations({
			changeLoadingIssueStatus: "issueState/changeLoadingIssueStatus",
			setIssue: "issueState/setIssue"
		}),

		async getIssue() {
			this.changeLoadingIssueStatus();
			const response = await http.get(`/issue/${this.selectedIssue}`);
			this.changeLoadingIssueStatus();

			if (response.ok) {
				this.setIssue(response.data.issue);
				this.selectedVote = this.youOnIssue.value || null;
			} else {
				console.error(response.data.message);
			}
		},

		async joinIssue() {
			const userName = this.storedUserName;
			const name = this.storedName;

			const response = await http.post(
				`/issue/${this.selectedIssue}/join`,
				{ name },
				{ headers: { userName } }
			);

			const message = response.data.message;

			if (response.ok) {
				this.getIssue();
				bulmaToast.toast({ message, type: "is-primary", duration: 5000 });

				const data = JSON.stringify({
					event: "join:issue",
					name: this.storedName,
					issue: this.selectedIssue,
					reference: this.reference
				});

				this.socket.send(data);
			} else {
				if (response.status === 401) {
					unauthorized();
				}

				bulmaToast.toast({ message, type: "is-danger", duration: 5000 });
			}
		},

		async voteIssue() {
			const userName = this.storedUserName;
			const value = this.selectedVote;

			const response = await http.post(
				`/issue/${this.selectedIssue}/vote`,
				{ value },
				{ headers: { userName } }
			);

			const message = response.data.message;

			if (response.ok) {
				this.getIssue();
				bulmaToast.toast({ message, type: "is-primary", duration: 5000 });

				const data = JSON.stringify({
					event: "vote:issue",
					name: this.storedName,
					issue: this.selectedIssue,
					reference: this.reference
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
