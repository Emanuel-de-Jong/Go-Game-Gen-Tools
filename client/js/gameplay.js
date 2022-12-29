var gameplay = {};


gameplay.OPPONENT_MIN_VISITS_PERC = 10;
gameplay.OPPONENT_MAX_VISIT_DIFF_PERC = 50;


gameplay.init = function () {
	gameplay.clear();
};

gameplay.clear = function() {
	gameplay.suggestionsPromise = null;
	gameplay.chosenNotPlayedCoordHistory = [];
	gameplay.isPlayerControlling = false;
	gameplay.isJumped = false;
	gameplay.playerTurnId = 0;
	gameplay.opponentTurnId = 0;
};


gameplay.givePlayerControl = function (isSuggestionNeeded = true) {
	G.setPhase(G.PHASE_TYPE.GAMEPLAY);

	board.editor.setTool("cross");
	gameplay.isPlayerControlling = true;
	if (isSuggestionNeeded) {
		gameplay.suggestionsPromise = G.analyze();
	}
};

gameplay.takePlayerControl = function() {
	board.editor.setTool("navOnly");
	gameplay.isPlayerControlling = false;
};

gameplay.updateChosenNotPlayedCoordHistory = function(coord) {
	let nodeCoord = board.getNodeCoord();
	if (!gameplay.chosenNotPlayedCoordHistory[nodeCoord.y]) {
		gameplay.chosenNotPlayedCoordHistory[nodeCoord.y] = [];
	}
	gameplay.chosenNotPlayedCoordHistory[nodeCoord.y][nodeCoord.x] = coord;
};

gameplay.playerMarkupPlacedCheckListener = async function(event) {
	if (event.markupChange && event.mark == 4 && gameplay.isPlayerControlling && !sgf.isSGFLoading) {
		gameplay.takePlayerControl();

		if (board.getNextColor() != settings.color) {
			settings.setColor();
		}

		let markupCoord = new Coord(event.x, event.y);
		board.removeMarkup(markupCoord);

        await gameplay.playerTurn(markupCoord);
    }
};

gameplay.playerTurn = async function(markupCoord) {
	let playerTurnId = ++gameplay.playerTurnId;
	
	await gameplay.handleJumped();
	if (playerTurnId != gameplay.playerTurnId) return;

	await gameplay.suggestionsPromise;
	if (G.isPassed) return;
	if (playerTurnId != gameplay.playerTurnId) return;

	let suggestionToPlay = G.suggestions.get(0);
	let isRightChoice = false;
	let isPerfectChoice = false;
	for (let i=0; i<G.suggestions.length(); i++) {
		if (markupCoord.compare(G.suggestions.get(i).coord)) {
			if (i == 0 || G.suggestions.get(i).visits == G.suggestions.get(0).visits) {
				isPerfectChoice = true;
			}

			isRightChoice = true;
			suggestionToPlay = G.suggestions.get(i);
			break;
		}
	}

	if (!settings.showWeakerOptions) {
		G.suggestions.filterWeakerThan(markupCoord);
		G.updateSuggestionsHistory();
	}
	
	await gameplay.playerPlay(isRightChoice, isPerfectChoice, suggestionToPlay, markupCoord);

	if (settings.showOptions) {
		board.nextButton.disabled = false;
	} else {
		await gameplay.nextButtonClickListener();
	}
};

gameplay.handleJumped = async function() {
	if (gameplay.isJumped) {
		await katago.setBoard();
		gameplay.suggestionsPromise = G.analyze();
		gameplay.isJumped = false;
	}
}

gameplay.playerPlay = async function(isRightChoice, isPerfectChoice, suggestionToPlay, markupCoord) {
	let opponentOptions = gameplay.getOpponentOptions();

	stats.updateRatioHistory(isRightChoice, isPerfectChoice);

	if (!settings.disableAICorrection || isRightChoice) {
		await board.play(suggestionToPlay, G.MOVE_TYPE.PLAYER);

		if (!isRightChoice) {
			await board.draw(markupCoord, "cross");
			gameplay.updateChosenNotPlayedCoordHistory(markupCoord);
		}
	} else {
		await board.play(await katago.analyzeMove(markupCoord), G.MOVE_TYPE.PLAYER);
	}

	gameplay.suggestionsPromise = G.analyze(settings.opponentVisits, opponentOptions, gameplay.OPPONENT_MIN_VISITS_PERC, gameplay.OPPONENT_MAX_VISIT_DIFF_PERC);
};

gameplay.getOpponentOptions = function() {
	let opponentOptions = 1;
	if (settings.opponentOptionsSwitch) {
		if ((utils.randomInt(100) + 1) <= settings.opponentOptionPerc) {
			opponentOptions = settings.opponentOptions;
		}
	}
	return opponentOptions;
};

gameplay.nextButtonClickListener = async function() {
	board.nextButton.disabled = true;
	await gameplay.opponentTurn();
};

gameplay.opponentTurn = async function() {
	let opponentTurnId = ++gameplay.opponentTurnId;

	await gameplay.suggestionsPromise;
	if (G.isPassed) return;
	if (opponentTurnId != gameplay.opponentTurnId) return;

	await board.play(G.suggestions.get(utils.randomInt(1, G.suggestions.length())), G.MOVE_TYPE.OPPONENT);

	gameplay.givePlayerControl();
};

gameplay.treeJumpedCheckListener = function(event) {
	if (event.navChange) {
		stats.setRatio();

		if (!event.treeChange ||
				(settings.showOptions && settings.color == board.getColor()) ||
				(settings.showOpponentOptions && settings.color != board.getColor())) {
			if (G.phase == G.PHASE_TYPE.GAMEPLAY) {
				stats.clearVisits();

				G.setSuggestions()

				if (G.suggestions) {
					stats.setVisits(G.suggestions);
					board.drawCoords(G.suggestions);
				}
			}
		}

		if (!event.treeChange) {
			gameplay.givePlayerControl(false);
	
			if (!gameplay.isJumped) {
				gameplay.isJumped = true;
				G.isPassed = false;
				board.nextButton.disabled = true;
			}
		}
	}
};