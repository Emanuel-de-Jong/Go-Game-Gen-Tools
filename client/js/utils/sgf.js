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
	return "GoTrainer-HumanAI " + main.VERSION;
};

sgf.createPreComment = function() {
	return "Pre move" +
	sgf.createCommentGrades();
};

sgf.createSelfplayComment = function() {
	return "Selfplay move" +
	sgf.createCommentGrades();
};

sgf.createPlayerComment = function() {
	return "Player move" +
	sgf.createCommentGrades();
};

sgf.createOpponentComment = function() {
	return "Opponent move" +
	sgf.createCommentGrades();
};

sgf.createCommentGrades = function() {
	comment = "";
	for (let i=0; i<main.suggestions.length(); i++) {
		let suggestion = main.suggestions.get(i);
        if (i != 0 && suggestion.visits == main.suggestions.get(i - 1).visits) continue;

		comment += "\n" + suggestion.grade + ": " + suggestion.visits;
	}

	return comment;
};


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
		case utils.MOVE_TYPE.HANDICAP:
			comment = "Handicap move";
			break;
		case utils.MOVE_TYPE.PRE_CORNER:
			comment = "Corner pre move";
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