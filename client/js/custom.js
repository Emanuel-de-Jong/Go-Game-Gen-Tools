var custom = {};

custom.restartButton = document.getElementById("restart");
custom.stopPreMovesButton = document.getElementById("stopPreMoves");
custom.selfplayButton = document.getElementById("selfplay");

custom.init = async function() {
	await custom.clear(utils.SOURCE.CUSTOM);
};

custom.clear = async function(source) {
	custom.suggestionsPromise = null;
	custom.selfplayPromise = null;
	custom.suggestionsToShow = [];
	custom.isPlayerControlling = false;
	custom.isJumped = false;
	custom.isFinished = false;
	custom.isSelfplay = false;
	custom.isPreMovesStopped = false;
	custom.playerTurnId = 0;
	custom.botTurnId = 0;

	if (source !== utils.SOURCE.SERVER) await server.init();

	if (source !== utils.SOURCE.STATS) stats.init();

	if (source !== utils.SOURCE.BOARD) {
		await board.init();
		board.editor.addListener(custom.boardEditorListener);
		board.nextButton.addEventListener("click", custom.nextButtonClickListener);

		custom.stopPreMovesButton.hidden = false;
		custom.selfplayButton.hidden = true;
		await custom.createPreMoves();
	}
};

custom.stopPreMovesButtonClickListener = function() {
	custom.isPreMovesStopped = true;
};
custom.stopPreMovesButton.addEventListener("click", custom.stopPreMovesButtonClickListener);

custom.finish = function(suggestion) {
	custom.isFinished = true;
	custom.takePlayerControl();
	board.disableNextButton();
	
	let result;
    if (suggestion.scoreLead >= 0) {
        result = utils.colorNumToName(suggestion.color) + "+" + suggestion.scoreLead;
    } else {
        result = utils.colorNumToName(suggestion.color * -1) + "+" + (suggestion.scoreLead * -1);
    }
	stats.setResult(result);
	board.sgf.setResult(result);
};

custom.analyze = async function({
		maxVisits = settings.suggestionStrength,
		moveOptions = settings.moveOptions,
		minVisitsPerc = settings.minVisitsPerc,
		maxVisitDiffPerc = settings.maxVisitDiffPerc,
		color = board.getNextColor() } = {}) {
	let suggestions = await server.analyze(maxVisits, color, moveOptions, minVisitsPerc, maxVisitDiffPerc);
	if (suggestions[0].coord == "pass") {
		custom.finish(suggestions[0]);
	}
	return suggestions;
};

custom.playPreMove = async function() {
	let suggestions = await custom.analyze({
		maxVisits: settings.preStrength,
		moveOptions: settings.preOptions,
		minVisitsPerc: 10,
		maxVisitDiffPerc: 50 });
	if (custom.isFinished) custom.isPreMovesStopped = true;
	if (custom.isPreMovesStopped) return;
	await board.play(suggestions[utils.randomInt(suggestions.length)]);
};

custom.createPreMoves = async function() {
	if (settings.preMovesSwitch) {
		let preMovesLeft = settings.preMoves;

		if (settings.handicap == 0 && settings.boardsize == 19) {
			if (settings.cornerSwitch44 ||
					settings.cornerSwitch34 ||
					settings.cornerSwitch33 ||
					settings.cornerSwitch45 ||
					settings.cornerSwitch35) {
				let cornerCount = preMovesLeft < 4 ? preMovesLeft : 4;
				let cornerCoords = board.fillCorners();
				for (let i=0; i<cornerCount; i++) {
					await board.play(await server.analyzeMove(cornerCoords[i]));
					preMovesLeft--;
				}
			}
		}
	
		for (let i=0; i<preMovesLeft; i++) {
			if (custom.isPreMovesStopped) break;
			await custom.playPreMove();
		}
	}

	if (settings.color == board.getColor()) {
		await custom.playPreMove();
	}

	custom.stopPreMovesButton.hidden = true;
	custom.selfplayButton.hidden = false;

	if (!custom.isFinished) {
		custom.givePlayerControl();
	}
};

custom.boardEditorListener = async function(event) {
	if (event.markupChange && custom.isPlayerControlling && !board.sgf.isSGFLoading) {
		custom.takePlayerControl();

		let markupCoord = new Coord(event.x, event.y);
		board.removeMarkup(markupCoord);

        await custom.playerTurn(markupCoord);
    } else if (event.navChange) {
		let currentMove = board.editor.getCurrent();
		if (board.lastMove.navTreeY != currentMove.navTreeY) {
			stats.scoreChart.clear();
		}

		if (board.lastMove.moveNumber+1 != currentMove.moveNumber ||
				board.lastMove.navTreeY != currentMove.navTreeY) {
			custom.isJumped = true;
			custom.isFinished = false;

			board.disableNextButton();
			custom.givePlayerControl(false);
		}
	}
};

custom.givePlayerControl = function(isSuggestionNeeded = true) {
	board.editor.setTool("cross");
	custom.isPlayerControlling = true;
	if (isSuggestionNeeded) {
		custom.suggestionsPromise = custom.analyze();
	}
};

custom.takePlayerControl = function() {
	board.editor.setTool("navOnly");
	custom.isPlayerControlling = false;
};

custom.nextButtonClickListener = async function() {
	board.disableNextButton();
	await custom.botTurn();
};

custom.playerTurn = async function(markupCoord) {
	let playerTurnId = ++custom.playerTurnId;
	
	if (custom.isJumped) {
		custom.isJumped = false;
		await server.setBoard();
		if (playerTurnId != custom.playerTurnId) return;
		custom.suggestionsPromise = custom.analyze();
	}

	let suggestions = await custom.suggestionsPromise;
	if (playerTurnId != custom.playerTurnId) return;
	if (custom.isFinished) return;

	let suggestionToPlay = suggestions[0];
	let isRightChoice = false;
	let isPerfectChoice = false;
	for (let i=0; i<suggestions.length; i++) {
		if (markupCoord.compare(suggestions[i].coord)) {
			if (i == 0 || suggestions[i].visits == suggestions[0].visits) {
				isPerfectChoice = true;
			}

			isRightChoice = true;
			suggestionToPlay = suggestions[i];
			break;
		}
	}
	
	if (!settings.disableAICorrection || isRightChoice) {
		await board.play(suggestionToPlay);

		if (!isRightChoice) await board.draw(markupCoord, "cross");

		custom.suggestionsPromise = custom.analyze({ maxVisits: settings.opponentStrength, moveOptions: 1 });
	} else {
		await board.draw(markupCoord, "auto", false);
	}

	custom.createSuggestionsToShow(suggestions, markupCoord);
	stats.updateRatio(isRightChoice, isPerfectChoice);
	stats.setVisits(custom.suggestionsToShow);

	if (!settings.skipNextButton) {
		board.drawCoords(custom.suggestionsToShow);
	}

	if (settings.disableAICorrection && !isRightChoice) {
		stats.scoreChart.update(await server.analyzeMove(markupCoord));
		await server.play(markupCoord);

		custom.suggestionsPromise = custom.analyze({ maxVisits: settings.opponentStrength, moveOptions: 1 });
	}

	if (!settings.skipNextButton) {
		board.enableNextButton();
	} else {
		await custom.nextButtonClickListener();
	}
};

custom.createSuggestionsToShow = function(suggestions, playedCoord) {
	custom.suggestionsToShow = [];
	for (let i=0; i<suggestions.length; i++) {
		custom.suggestionsToShow.push(suggestions[i]);
		if (settings.hideWeakerOptions && suggestions[i].coord.compare(playedCoord)) {
			break;
		}
	}

	let gradeIndex = 0;
	for (let i=0; i<custom.suggestionsToShow.length; i++) {
		let suggestion = custom.suggestionsToShow[i];
		if (i != 0 && suggestion.visits != custom.suggestionsToShow[i - 1].visits) {
			gradeIndex++;
		}
		suggestion.grade = String.fromCharCode(gradeIndex + 65);
	}
};

custom.botTurn = async function() {
	let botTurnId = ++custom.botTurnId;

	let suggestions = await custom.suggestionsPromise;
	if (botTurnId != custom.botTurnId) return;
	if (custom.isFinished) return;

	if (settings.skipNextButton) {
		board.drawCoords(custom.suggestionsToShow);
	}
	
	await board.play(suggestions[0]);

	custom.givePlayerControl();
};

custom.restartButtonClickListener = async function() {
	await custom.clear(utils.SOURCE.CUSTOM);
};
custom.restartButton.addEventListener("click", custom.restartButtonClickListener);

custom.selfplayButtonClickListener = async function() {
	if (!custom.isSelfplay) {
		custom.isSelfplay = true;
		custom.selfplayButton.innerHTML = "Stop selfplay";

		custom.takePlayerControl();
		board.disableNextButton();

		stats.clearVisits();

		custom.selfplayPromise = custom.selfplay();
	} else {
		custom.isSelfplay = false;
		custom.selfplayButton.innerHTML = "Start selfplay";

		await custom.selfplayPromise;

		if (!custom.isFinished) {
			custom.givePlayerControl();
		}
	}
};
custom.selfplayButton.addEventListener("click", custom.selfplayButtonClickListener);

custom.selfplay = async function() {
	while (custom.isSelfplay || settings.color != board.getNextColor()) {
		let suggestions = await custom.analyze({ maxVisits: settings.selfplayStrength, moveOptions: 1 });
		if (custom.isFinished) {
			custom.selfplayButton.click();
			return;
		}

		if (!custom.isSelfplay && settings.color == board.getNextColor()) return;

		await board.play(suggestions[0]);
	}
};


(function () {

	custom.init();

})();