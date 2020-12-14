export const issueState = {
	namespaced: true,
	state: () => ({
		loadingIssue: false,
		loadigIssues: false,
		activateCreateIssueModal: false,
		issues: [],
		issue: { members: [] },
		selectedIssue: null
	}),
	mutations: {
		changeCreateIssueModalStatus(state) {
			state.activateCreateIssueModal = !state.activateCreateIssueModal;
		},

		changeLoadingIssueStatus(state) {
			state.loadingIssue = !state.loadingIssue;
		},

		changeLoadingIssuesStatus(state) {
			state.loadingIssues = !state.loadingIssues;
		},

		setIssues(state, payload) {
			state.issues = payload;
		},

		setIssue(state, payload) {
			state.issue = payload;
		},

		setSelectedIssue(state, payload) {
			state.selectedIssue = payload;
		}
	},
	actions: {},
	getters: {}
};
