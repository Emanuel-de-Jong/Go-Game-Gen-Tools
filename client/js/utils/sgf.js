var sgf = {};


sgf.init = function() {
	document.addEventListener("sgfLoadingEvent", sgf.sgfLoadingEventListener);
	
	besogo.loadSgf = (function() {
		let cachedFunction = besogo.loadSgf;
		
		return function() {
			let editor = arguments[1];
			document.dispatchEvent(editor.sgfLoadingEvent);
			cachedFunction.apply(this, arguments);
			document.dispatchEvent(editor.sgfLoadedEvent);
		}
	})();
	
	document.addEventListener("sgfLoadedEvent", sgf.sgfLoadedEventListener);

	sgf.clear();
};

sgf.clear = function() {
	sgf.isSGFLoading = false;

	board.editor.setGameInfo("GoTrainer-HumanAI", "GN");
	board.editor.setGameInfo("GoTrainer-HumanAI", "SO");
	board.editor.setGameInfo(Date(), "DT");

	sgf.setPlayers();
	sgf.setRankPlayer();
	sgf.setRankAI();
	sgf.setHandicap();
	sgf.setRuleset();
	sgf.setKomi();
	
	board.editor.sgfLoadingEvent = new Event("sgfLoadingEvent");
	board.editor.sgfLoadedEvent = new Event("sgfLoadedEvent");
};


sgf.sgfLoadingEventListener = function() {
	sgf.isSGFLoading = true;
};

sgf.sgfLoadedEventListener = function() {
	let gameInfo = board.editor.getGameInfo();

	if (gameInfo.RE) {
		stats.setResult(gameInfo.RE);
	}

	if (!confirm("Would you like to use the komi and ruleset of the SGF?")) return;

	settings.setSetting("komiChangeStyle", "custom");
	settings.setSetting("komi", parseFloat(gameInfo.KM));

	if (gameInfo.RU) {
		let ruleset = gameInfo.RU.toLowerCase();
		if (ruleset.includes("japan")) {
			settings.setSetting("ruleset", "japanese");
		} else if (ruleset.includes("chin") || ruleset.includes("korea")) {
			settings.setSetting("ruleset", "chinese");
		}
	}

	sgf.isSGFLoading = false;
};


sgf.createInitComment = function() {
	return "GoTrainer-HumanAI " + main.VERSION +
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

sgf.createHandicapComment = function() {
	return "Handicap move" +
		sgf.createCommentScore();
};

sgf.createCornerPreComment = function() {
	return "Corner pre move" +
		sgf.createCommentScore();
};

sgf.createPreComment = function() {
	return "Pre move" +
		sgf.createCommentVisits() +
		"\n" + sgf.createCommentScore();
};

sgf.createSelfplayComment = function() {
	return "Selfplay move" +
		sgf.createCommentVisits() +
		"\n" + sgf.createCommentScore();
};

sgf.createPlayerComment = function() {
	return "Player move" +
		sgf.createCommentVisits() +
		"\n" + sgf.createCommentRatio() +
		"\n" + sgf.createCommentScore();
};

sgf.createOpponentComment = function() {
	return "Opponent move" +
		sgf.createCommentVisits() +
		"\n" + sgf.createCommentRatio() +
		"\n" + sgf.createCommentScore();
};

sgf.createCommentVisits = function() {
	let suggestions = main.suggestions;
	if (suggestions == null) return "";

	comment = "\nVisits";
	for (let i=0; i<suggestions.length(); i++) {
		let suggestion = suggestions.get(i);
        if (i != 0 && suggestion.visits == suggestions.get(i - 1).visits) continue;

		comment += "\n" + suggestion.grade + ": " + suggestion.visits;
	}

	return comment;
};

sgf.createCommentRatio = function() {
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

sgf.createCommentScore = function() {
	let score = scoreChart.getCurrent();
	console.log(score);
	if (score == null) return "";

	return "\nScore " + utils.colorNumToName(score.color) +
		"\nWinrate: " + score.winrate +
		"\nScore: " + score.score;
}


sgf.setPlayers = function() {
	board.editor.setGameInfo("Player", "P" + utils.colorNumToName(settings.color));
	board.editor.setGameInfo("AI", "P" + utils.colorNumToName(settings.color * -1));
};

sgf.setRankPlayer = function() {
	board.editor.setGameInfo(settings.suggestionVisits + "", utils.colorNumToName(settings.color) + "R");
};

sgf.setRankAI = function() {
	board.editor.setGameInfo(settings.opponentVisits + "", utils.colorNumToName(settings.color * -1) + "R");
};

sgf.setHandicap = function() {
	board.editor.setGameInfo(settings.handicap + "", "HA");
};

sgf.setRuleset = function() {
	board.editor.setGameInfo(settings.ruleset, "RU");
};

sgf.setKomi = function() {
	board.editor.setGameInfo(settings.komi + "", "KM");
};

sgf.setResult = function(result) {
	board.editor.setGameInfo(result, "RE");
};

sgf.setComment = function(moveType) {
	if (moveType == utils.MOVE_TYPE.NONE) return;

	let comment;
	switch (moveType) {
		case utils.MOVE_TYPE.INIT:
			comment = sgf.createInitComment();
			break;
		case utils.MOVE_TYPE.HANDICAP:
			comment = sgf.createHandicapComment();
			break;
		case utils.MOVE_TYPE.PRE_CORNER:
			comment = sgf.createCornerPreComment();
			break;
		case utils.MOVE_TYPE.PRE:
			comment = sgf.createPreComment();
			break;
		case utils.MOVE_TYPE.SELFPLAY:
			comment = sgf.createSelfplayComment();
			break;
		case utils.MOVE_TYPE.PLAYER:
			comment = sgf.createPlayerComment();
			break;
		case utils.MOVE_TYPE.OPPONENT:
			comment = sgf.createOpponentComment();
			break;
	}

	board.editor.setComment(comment);
	board.commentElement.scrollTop = 0;
};