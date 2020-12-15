<template>
	<div>
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
							@click="changeCreateIssueModalStatus()"
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
						setSelectedIssue(issue);
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
					v-show="loadingIssues"
					class="progress is-small is-info"
					max="100"
					>15%</progress
				>
			</transition>
		</div>
	</div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import http from "../service/api";

export default {
	name: "issueComponent",
	data() {
		return {};
	},

	computed: {
		...mapState({
			loadingIssues: state => state.issueState.loadingIssues,
			issues: state => state.issueState.issues,
			issue: state => state.issueState.issue,
			selectedIssue: state => state.issueState.selectedIssue
		})
	},

	mounted() {
		this.getIssues();
	},

	methods: {
		...mapMutations({
			changeCreateIssueModalStatus: "issueState/changeCreateIssueModalStatus",
			changeLoadingIssuesStatus: "issueState/changeLoadingIssuesStatus",
			setIssues: "issueState/setIssues",
			setSelectedIssue: "issueState/setSelectedIssue"
		}),

		async getIssues() {
			this.changeLoadingIssuesStatus();
			const response = await http.get("/issue/all");
			this.changeLoadingIssuesStatus();

			if (response.ok) {
				this.setIssues(response.data.issues);
			} else {
				console.error(response.data.message);
			}
		},

		getIssue() {
			this.$emit("getIssue");
		}
	}
};
</script>
