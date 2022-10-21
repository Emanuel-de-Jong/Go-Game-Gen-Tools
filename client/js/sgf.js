var sgf = {};


sgf.init = function() {
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
document.addEventListener("sgfLoadingEvent", sgf.sgfLoadingEventListener);

sgf.sgfLoadedEventListener = async function() {
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

sgf.setComment = function(comment) {
	board.editor.setComment(comment);
	board.commentElement.scrollTop = 0;
};