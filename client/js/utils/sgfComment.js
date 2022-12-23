var sgfComment = {};


sgfComment.init = function() {
    sgfComment.clear();
};

sgfComment.clear = function() {
	sgfComment.setComment(G.MOVE_TYPE.INIT);
};


sgfComment.setComment = function(moveType) {
	if (moveType == G.MOVE_TYPE.NONE) return;

	let comment;
	switch (moveType) {
		case G.MOVE_TYPE.INIT:
			comment = sgfComment.createInitComment();
			break;
		case G.MOVE_TYPE.HANDICAP:
			comment = sgfComment.createHandicapComment();
			break;
		case G.MOVE_TYPE.PRE_CORNER:
			comment = sgfComment.createCornerPreComment();
			break;
		case G.MOVE_TYPE.PRE:
			comment = sgfComment.createPreComment();
			break;
		case G.MOVE_TYPE.SELFPLAY:
			comment = sgfComment.createSelfplayComment();
			break;
		case G.MOVE_TYPE.PLAYER:
			comment = sgfComment.createPlayerComment();
			break;
		case G.MOVE_TYPE.OPPONENT:
			comment = sgfComment.createOpponentComment();
			break;
	}

	board.editor.setComment(comment);
	board.commentElement.scrollTop = 0;
};

sgfComment.createInitComment = function() {
	return "GoTrainer-HumanAI " + G.VERSION +
		"\nBoard size: " + settings.boardsize +
		"\nHandicap: " + settings.handicap +
		"\nColor: " + settings.colorType +
		"\nPre moves switch: " + settings.preMovesSwitch +
		"\nPre moves: " + settings.preMoves +
		"\nPre move strength: " + settings.preVisits +
		"\nSelfplay strength: " + settings.selfplayVisits +
		"\nSuggestion strength: " + settings.suggestionVisits +
		"\nOpponent strength: " + settings.opponentVisits +
		"\nDisable AI correction: " + settings.disableAICorrection +

		"\n\nGame" +
		"\nRuleset: " + settings.ruleset +
		"\nKomi change style: " + settings.komiChangeStyle +
		"\nKomi: " + settings.komi +

		"\n\nPre moves" +
		"\nOptions: " + settings.preOptions +
		"\nOption chance: " + settings.preOptionPerc + "%" +
		"\n4-4 switch: " + settings.cornerSwitch44 +
		"\n4-4 chance: " + settings.cornerChance44 +
		"\n3-4 switch: " + settings.cornerSwitch34 +
		"\n3-4 chance: " + settings.cornerChance34 +
		"\n3-3 switch: " + settings.cornerSwitch33 +
		"\n3-3 chance: " + settings.cornerChance33 +
		"\n4-5 switch: " + settings.cornerSwitch45 +
		"\n4-5 chance: " + settings.cornerChance45 +
		"\n3-5 switch: " + settings.cornerSwitch35 +
		"\n3-5 chance: " + settings.cornerChance35 +

		"\n\nFilters" +
		"\nSuggestion options: " + settings.suggestionOptions +
		"\nShow options: " + settings.showOptions +
		"\nShow weaker options: " + settings.showWeakerOptions +
		"\nMin strength switch: " + settings.minVisitsPercSwitch +
		"\nMin strength: " + settings.minVisitsPerc + "%" +
		"\nMax strength difference switch: " + settings.maxVisitDiffPercSwitch +
		"\nMax strength difference: " + settings.maxVisitDiffPerc +

		"\n\nOpponent" +
		"\nOptions switch: " + settings.opponentOptionsSwitch +
		"\nOptions: " + settings.opponentOptions +
		"\nOption chance: " + settings.opponentOptionPerc + "%" +
		"\nShow options: " + settings.showOpponentOptions;
};

sgfComment.createHandicapComment = function() {
	return "Handicap move" +
		sgfComment.createCommentScore();
};

sgfComment.createCornerPreComment = function() {
	return "Corner pre move" +
		sgfComment.createCommentScore();
};

sgfComment.createPreComment = function() {
	return "Pre move" +
		sgfComment.createCommentVisits() +
		"\n" + sgfComment.createCommentScore();
};

sgfComment.createSelfplayComment = function() {
	return "Selfplay move" +
		sgfComment.createCommentVisits() +
		"\n" + sgfComment.createCommentScore();
};

sgfComment.createPlayerComment = function() {
	return "Player move" +
		sgfComment.createCommentVisits() +
		"\n" + sgfComment.createCommentRatio() +
		"\n" + sgfComment.createCommentScore();
};

sgfComment.createOpponentComment = function() {
	return "Opponent move" +
		sgfComment.createCommentVisits() +
		"\n" + sgfComment.createCommentRatio() +
		"\n" + sgfComment.createCommentScore();
};

sgfComment.createCommentVisits = function() {
	let suggestions = G.suggestions;
	if (suggestions == null) return "";

	comment = "\nVisits";
	for (let i=0; i<suggestions.length(); i++) {
		let suggestion = suggestions.get(i);
        if (i != 0 && suggestion.visits == suggestions.get(i - 1).visits) continue;

		comment += "\n" + suggestion.grade + ": " + suggestion.visits;
	}

	return comment;
};

sgfComment.createCommentRatio = function() {
	let ratio = stats.ratio;
	if (ratio == null) return "";

	return "\nRight" +
		"\nRatio: " + ratio.rightPercent + "%" +
		"\nStreak: " + ratio.rightStreak +
		"\nTop streak: " + ratio.rightTopStreak +

		"\n\nPerfect" +
		"\nRatio: " + ratio.perfectPercent + "%" +
		"\nStreak: " + ratio.perfectStreak +
		"\nTop streak: " + ratio.perfectTopStreak;
}

sgfComment.createCommentScore = function() {
	let score = scoreChart.getCurrent();
	if (score == null) return "";

	return "\nScore " + G.colorNumToName(score.color) +
		"\nWinrate: " + score.winrate +
		"\nScore: " + score.score;
}