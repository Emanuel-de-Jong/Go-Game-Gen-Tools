class SGF {

	isSGFLoading = false;

    constructor() {
		board.editor.setGameInfo("GoTrainer-HumanAI", "GN");
		board.editor.setGameInfo("GoTrainer-HumanAI", "SO");
		board.editor.setGameInfo(Date(), "DT");
	
		this.setRankPlayer();
		this.setRankAI();
		this.setPlayers();
		this.setHandicap();
		this.setKomi();
		
		board.editor.sgfLoadingEvent = new Event("sgfLoadingEvent");
		board.editor.sgfLoadedEvent = new Event("sgfLoadedEvent");

		besogo.loadSgf = (function() {
			let cachedFunction = besogo.loadSgf;
			
			return function() {
				let editor = arguments[1];
				document.dispatchEvent(editor.sgfLoadingEvent);
				cachedFunction.apply(this, arguments);
				document.dispatchEvent(editor.sgfLoadedEvent);
			}
		})();

		document.addEventListener("sgfLoadingEvent", this.sgfLoadingEventListener);
		document.addEventListener("sgfLoadedEvent", this.sgfLoadedEventListener);
		document.addEventListener("customFinished", this.customFinishedListener);
    }

	sgfLoadingEventListener() {
		this.isSGFLoading = true;
	}

	async sgfLoadedEventListener() {
		this.isSGFLoading = false;

		await custom.clear(utils.SOURCE.BOARD);

		let gameInfo = board.editor.getGameInfo();

		if (gameInfo.RE) {
			stats.setResult(gameInfo.RE);
		}

		if (!confirm("Would you like to use the komi and ruleset of the SGF?")) return;

		if (settings.komi != gameInfo.KM) {
			settings.setSetting("komi", parseFloat(gameInfo.KM));
		}

		if (gameInfo.RU) {
			let ruleset = gameInfo.RU.toLowerCase();
			if (ruleset.includes("japan")) {
				settings.setSetting("ruleset", "japanese");
			} else if (ruleset.includes("chin") || ruleset.includes("korea")) {
				settings.setSetting("ruleset", "chinese");
			}
		}
	}

	customFinishedListener(event) {
		board.sgf.setResult(event.detail.result);
	}

    setRankPlayer() {
		board.editor.setGameInfo(settings.suggestionStrength + "", utils.colorNumToName(settings.color) + "R");
	}
	
	setRankAI() {
		board.editor.setGameInfo(settings.opponentStrength + "", utils.colorNumToName(settings.color * -1) + "R");
	}
	
	setPlayers() {
		board.editor.setGameInfo("Player", "P" + utils.colorNumToName(settings.color));
		board.editor.setGameInfo("AI", "P" + utils.colorNumToName(settings.color * -1));
	}
	
	setRuleset() {
		board.editor.setGameInfo(settings.ruleset, "RU");
	}
	
	setHandicap() {
		board.editor.setGameInfo(settings.handicap + "", "HA");
	}
	
	setKomi() {
		board.editor.setGameInfo(settings.komi + "", "KM");
	}
	
	setResult(result) {
		board.editor.setGameInfo(result, "RE");
	}

}