module.exports = async function checkVote(req, res, next) {
	const voteValue = req.body.value;

	const vote =
		typeof voteValue === "number" || voteValue === "?" ? voteValue : 0;

	if (!vote) {
		return res.status(403).json({
			message: "The vote is not valid",
		});
	}

	next();
};
