class SGF {

    constructor() {
		board.editor.setGameInfo("GoTrainer-HumanAI", "GN");
		board.editor.setGameInfo("GoTrainer-HumanAI", "SO");
		board.editor.setGameInfo(Date(), "DT");
	
		this.setRankPlayer();
		this.setRankAI();
		this.setPlayers();
		this.setHandicap();
		this.setKomi();

		document.addEventListener("sgfLoadedEvent", () => {
			let gameInfo = board.editor.getGameInfo();

			if (settings.komi != gameInfo.KM) {
				settings.setSetting("komi", parseFloat(gameInfo.KM));
			}
		});
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