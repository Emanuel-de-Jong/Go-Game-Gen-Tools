var main = {};


main.OPPONENT_MIN_VISITS_PERC = 10;
main.OPPONENT_MAX_VISIT_DIFF_PERC = 50;


main.init = function() {
	main.clear();
};

main.clear = function() {
	main.suggestionsPromise = null;
	main.suggestions = null;
	main.suggestionsHistory = [];
	main.isPlayerControlling = false;
	main.isJumped = false;
	main.isPassed = false;
	main.playerTurnId = 0;
	main.opponentTurnId = 0;
};


main.analyze = async function(maxVisits, moveOptions, minVisitsPerc, maxVisitDiffPerc, color) {
	main.suggestions = await server.analyze(maxVisits, moveOptions, minVisitsPerc, maxVisitDiffPerc, color);

	main.pass(main.suggestions.passSuggestion);

	main.updateSuggestionsHistory();
};

main.pass = function(suggestion) {
	if (!suggestion) return;

	main.isPassed = true;
	main.takePlayerControl();
	board.nextButton.disabled = true;

	let result;
    if (suggestion.scoreLead >= 0) {
        result = utils.colorNumToName(suggestion.color) + "+" + suggestion.scoreLead;
    } else {
        result = utils.colorNumToName(suggestion.color * -1) + "+" + (suggestion.scoreLead * -1);
    }
	stats.setResult(result);
	sgf.setResult(result);

	board.pass();
};

main.givePlayerControl = function(isSuggestionNeeded = true) {
	board.editor.setTool("cross");
	main.isPlayerControlling = true;
	if (isSuggestionNeeded) {
		main.suggestionsPromise = main.analyze();
	}
};

main.takePlayerControl = function() {
	board.editor.setTool("navOnly");
	main.isPlayerControlling = false;
};

main.updateSuggestionsHistory = function() {
	let currentMove = board.editor.getCurrent();
	let y = currentMove.navTreeY;
	let x = currentMove.moveNumber + 1;

	if (!main.suggestionsHistory[y]) {
		main.suggestionsHistory[y] = [];
	}
	main.suggestionsHistory[y][x] = main.suggestions;
};

main.playerMarkupPlacedCheckListener = async function(event) {
	if (event.markupChange && event.mark == 4 && main.isPlayerControlling && !sgf.isSGFLoading) {
		main.takePlayerControl();

		let markupCoord = new Coord(event.x, event.y);
		board.removeMarkup(markupCoord);

        await main.playerTurn(markupCoord);
    }
};

main.playerTurn = async function(markupCoord) {
	let playerTurnId = ++main.playerTurnId;
	
	await main.handleJumped();
	if (playerTurnId != main.playerTurnId) return;

	await main.suggestionsPromise;
	if (main.isPassed) return;
	if (playerTurnId != main.playerTurnId) return;

	let suggestionToPlay = main.suggestions.get(0);
	let isRightChoice = false;
	let isPerfectChoice = false;
	for (let i=0; i<main.suggestions.length(); i++) {
		if (markupCoord.compare(main.suggestions.get(i).coord)) {
			if (i == 0 || main.suggestions.get(i).visits == main.suggestions.get(0).visits) {
				isPerfectChoice = true;
			}

			isRightChoice = true;
			suggestionToPlay = main.suggestions.get(i);
			break;
		}
	}

	if (!settings.showWeakerOptions) {
		main.suggestions.filterWeakerThan(markupCoord);
		main.updateSuggestionsHistory();
	}
	
	await main.playerPlay(isRightChoice, isPerfectChoice, suggestionToPlay, markupCoord);

	if (settings.showOptions) {
		board.nextButton.disabled = false;
	} else {
		await main.nextButtonClickListener();
	}
};

main.handleJumped = async function() {
	if (main.isJumped) {
		await server.setBoard();
		main.suggestionsPromise = main.analyze();
		main.isJumped = false;
	}
}

main.playerPlay = async function(isRightChoice, isPerfectChoice, suggestionToPlay, markupCoord) {
	let opponentOptions = main.getOpponentOptions();

	if (!settings.disableAICorrection || isRightChoice) {
		await board.play(suggestionToPlay, utils.MOVE_TYPE.PLAYER);

		if (!isRightChoice) await board.draw(markupCoord, "cross");

		main.suggestionsPromise = main.analyze(settings.opponentVisits, opponentOptions, main.OPPONENT_MIN_VISITS_PERC, main.OPPONENT_MAX_VISIT_DIFF_PERC);
	} else {
		await board.draw(markupCoord, "auto", false, utils.MOVE_TYPE.PLAYER);
	}

	stats.updateRatio(isRightChoice, isPerfectChoice);

	if (settings.disableAICorrection && !isRightChoice) {
		scoreChart.update(await server.analyzeMove(markupCoord));
		await server.play(markupCoord);

		main.suggestionsPromise = main.analyze(settings.opponentVisits, opponentOptions, main.OPPONENT_MIN_VISITS_PERC, main.OPPONENT_MAX_VISIT_DIFF_PERC);
	}
};

main.getOpponentOptions = function() {
	let opponentOptions = 1;
	if (settings.opponentOptionsSwitch) {
		if ((utils.randomInt(100) + 1) <= settings.opponentOptionPerc) {
			opponentOptions = settings.opponentOptions;
		}
	}
	return opponentOptions;
};

main.nextButtonClickListener = async function() {
	board.nextButton.disabled = true;
	await main.opponentTurn();
};

main.opponentTurn = async function() {
	let opponentTurnId = ++main.opponentTurnId;

	await main.suggestionsPromise;
	if (main.isPassed) return;
	if (opponentTurnId != main.opponentTurnId) return;

	await board.play(main.suggestions.get(utils.randomInt(1, main.suggestions.length())), utils.MOVE_TYPE.OPPONENT);

	main.givePlayerControl();
};

main.treeJumpedCheckListener = function(event) {
	if (event.navChange) {
		if (!event.treeChange ||
				(settings.showOptions && settings.color == board.getColor()) ||
				(settings.showOpponentOptions && settings.color != board.getColor())) {
			stats.clearVisits();

			let currentMove = board.editor.getCurrent();
			main.setSuggestions(currentMove.moveNumber, currentMove.navTreeY)
	
			if (main.suggestions) {
				stats.setVisits(main.suggestions);
				board.drawCoords(main.suggestions);
			}
		}

		if (!event.treeChange) {
			main.givePlayerControl(false);
	
			if (!main.isJumped) {
				main.isJumped = true;
				main.isPassed = false;
				board.nextButton.disabled = true;
			}
		}
	}
};

main.setSuggestions = function(x, y) {
	main.suggestions = null;
	if (main.suggestionsHistory[y]) {
		main.suggestions = main.suggestionsHistory[y][x];
	}
};