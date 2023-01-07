var sgf = {};


sgf.init = function() {
	sgf.sgfLoadingEvent = new CEvent(sgf.sgfLoadingListener);
	sgf.sgfLoadedEvent = new CEvent(sgf.sgfLoadedListener);

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
};


sgf.boardEditorListener = function(event) {
	if (event.sgfEvent) {
		if (!event.sgfLoaded) {
			sgf.sgfLoadingEvent.dispatch();
		} else {
			sgf.sgfLoadedEvent.dispatch();
		}
	}
}

sgf.sgfLoadingListener = function() {
	sgf.isSGFLoading = true;
};

sgf.sgfLoadedListener = function() {
	let gameInfo = board.editor.getGameInfo();

	if (gameInfo.RE) {
		stats.setResult(gameInfo.RE);
	}

	settings.setColor();

	if (confirm("Would you like to use the komi and ruleset of the SGF?")) {
		settings.setSetting("komiChangeStyle", "Custom");
		settings.setSetting("komi", parseFloat(gameInfo.KM));
	
		if (gameInfo.RU) {
			let ruleset = gameInfo.RU.toLowerCase();
			if (ruleset.includes("japan")) {
				settings.setSetting("ruleset", "Japanese");
			} else if (ruleset.includes("chin") || ruleset.includes("korea")) {
				settings.setSetting("ruleset", "Chinese");
			}
		}
	}

	sgf.isSGFLoading = false;
};


sgf.setPlayers = function() {
	board.editor.setGameInfo("Player", "P" + G.colorNumToName(settings.color));
	board.editor.setGameInfo("AI", "P" + G.colorNumToName(settings.color * -1));
};

sgf.setRankPlayer = function() {
	board.editor.setGameInfo(settings.suggestionVisits + "", G.colorNumToName(settings.color) + "R");
};

sgf.setRankAI = function() {
	board.editor.setGameInfo(settings.opponentVisits + "", G.colorNumToName(settings.color * -1) + "R");
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