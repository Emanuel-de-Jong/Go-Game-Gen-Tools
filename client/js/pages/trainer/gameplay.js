var gameplay = {};


gameplay.OPPONENT_MIN_VISITS_PERC = 10;
gameplay.OPPONENT_MAX_VISIT_DIFF_PERC = 50;


gameplay.init = function () {
	gameplay.clear();
};

gameplay.clear = function() {
	gameplay.suggestionsPromise = null;
	gameplay.chosenNotPlayedCoordHistory = new History();
	gameplay.isPlayerControlling = false;
	gameplay.isJumped = false;
	gameplay.playerTurnId = 0;
	gameplay.opponentTurnId = 0;

	if (debug.TEST_DATA == 1) {
        gameplay.chosenNotPlayedCoordHistory.add(new Coord(8, 12), 2, 0);
        gameplay.chosenNotPlayedCoordHistory.add(new Coord(17, 17), 4, 1);
    }
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

gameplay.playerMarkupPlacedCheckListener = async function(event) {
	if (event.markupChange && event.mark == 4 && gameplay.isPlayerControlling && !sgf.isSGFLoading) {
		gameplay.takePlayerControl();

		if (board.getNextColor() != G.color) {
			G.setColor();
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

	G.suggestions.chosenCoord = markupCoord;
	G.updateSuggestionsHistory();

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
	
	await gameplay.playerPlay(isRightChoice, isPerfectChoice, suggestionToPlay);

	if (settings.showOptions) {
		board.nextButton.disabled = false;
	} else {
		await gameplay.nextButtonClickListener();
	}
};

gameplay.handleJumped = async function() {
	if (gameplay.isJumped) {
		await board.syncWithServer();
		gameplay.suggestionsPromise = G.analyze();
		gameplay.isJumped = false;
	}
}

gameplay.playerPlay = async function(isRightChoice, isPerfectChoice, suggestionToPlay) {
	let opponentOptions = gameplay.getOpponentOptions();

	stats.updateRatioHistory(isRightChoice, isPerfectChoice);

	if (!settings.disableAICorrection || isRightChoice) {
		await board.play(suggestionToPlay, G.MOVE_TYPE.PLAYER);

		if (!isRightChoice) {
			await board.draw(G.suggestions.chosenCoord, "cross");
			gameplay.chosenNotPlayedCoordHistory.add(G.suggestions.chosenCoord);
		}
	} else {
		await board.play(await katago.analyzeMove(G.suggestions.chosenCoord), G.MOVE_TYPE.PLAYER);
	}

	if (!cornerPlacer.shouldForce()) {
		gameplay.suggestionsPromise = G.analyze(settings.opponentVisits, opponentOptions, gameplay.OPPONENT_MIN_VISITS_PERC, gameplay.OPPONENT_MAX_VISIT_DIFF_PERC);
	}
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

	if (cornerPlacer.shouldForce()) {
		let suggestion = await cornerPlacer.getSuggestion();
		if (opponentTurnId != gameplay.opponentTurnId) return;
		
		await cornerPlacer.play(suggestion);
	}
	else {
		await gameplay.suggestionsPromise;
		if (G.isPassed) return;
		if (opponentTurnId != gameplay.opponentTurnId) return;

		await board.play(G.suggestions.get(utils.randomInt(G.suggestions.length())), G.MOVE_TYPE.OPPONENT);
	}

	gameplay.givePlayerControl();
};

gameplay.treeJumpedCheckListener = function(event) {
	if (event.navChange) {
		stats.setRatio();

		if (!event.treeChange ||
				(settings.showOptions && G.color == board.getColor()) ||
				(settings.showOpponentOptions && G.color != board.getColor())) {
			if (G.phase == G.PHASE_TYPE.GAMEPLAY) {
				stats.clearVisits();

				G.suggestions = G.suggestionsHistory.get();

				if (G.suggestions) {
					stats.setVisits(G.suggestions);
					board.drawCoords(G.suggestions);
				}
			}
		}

		if (!event.treeChange) {
			gameplay.givePlayerControl(false);

			scoreChart.refresh();
	
			if (!gameplay.isJumped) {
				gameplay.isJumped = true;
				G.isPassed = false;
				board.nextButton.disabled = true;
			}
		}
	}
};