var custom = {};

custom.restartButton = document.getElementById("restart");
custom.stopPreMovesButton = document.getElementById("stopPreMoves");
custom.selfplayButton = document.getElementById("selfplay");

custom.init = async function() {
	await custom.clear(utils.SOURCE.CUSTOM);
};

custom.clear = async function(source) {
	custom.suggestionsPromise;
	custom.suggestions;
	custom.suggestionsHistory = [];
	custom.selfplayPromise;
	custom.isPlayerControlling = false;
	custom.isJumped = false;
	custom.isPassed = false;
	custom.isSelfplay = false;
	custom.isPreMovesStopped = false;
	custom.playerTurnId = 0;
	custom.opponentTurnId = 0;

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

custom.pass = function(suggestion) {
	custom.isPassed = true;
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

	board.pass();
};

custom.analyze = async function({
		maxVisits = settings.suggestionVisits,
		moveOptions = settings.suggestionOptions,
		minVisitsPerc = settings.minVisitsPerc,
		maxVisitDiffPerc = settings.maxVisitDiffPerc,
		color = board.getNextColor() } = {}) {
	let suggestionsWithPass = await server.analyze(maxVisits, color, moveOptions, minVisitsPerc, maxVisitDiffPerc);
	
	custom.suggestions = [];
	for (let i=0; i<suggestionsWithPass.length; i++) {
		if (!suggestionsWithPass[i].isPass()) {
			custom.suggestions.push(suggestionsWithPass[i]);
		}
	}

	if (suggestionsWithPass[0].isPass()) {
		custom.pass(suggestionsWithPass[0]);
	}

	let gradeIndex = 0;
	for (let i=0; i<custom.suggestions.length; i++) {
		let suggestion = custom.suggestions[i];
		if (i != 0 && suggestion.visits != custom.suggestions[i - 1].visits) {
			gradeIndex++;
		}
		suggestion.grade = String.fromCharCode(gradeIndex + 65);
	}

	custom.updateSuggestionsHistory();
};

custom.updateSuggestionsHistory = function() {
	let currentMove = board.editor.getCurrent();
	if (!custom.suggestionsHistory[currentMove.navTreeY]) {
		custom.suggestionsHistory[currentMove.navTreeY] = [];
	}
	custom.suggestionsHistory[currentMove.navTreeY][currentMove.moveNumber] = custom.suggestions;
};

custom.playPreMove = async function() {
	let preOptions = 1;
	if ((utils.randomInt(100) + 1) <= settings.preOptionPerc) {
		preOptions = settings.preOptions;
	}

	await custom.analyze({
		maxVisits: settings.preVisits,
		moveOptions: preOptions,
		minVisitsPerc: 10,
		maxVisitDiffPerc: 50 });
	if (custom.isPassed) custom.isPreMovesStopped = true;
	if (custom.isPreMovesStopped) return;

	await board.play(custom.suggestions[utils.randomInt(custom.suggestions.length)], custom.createPreMoveComment());
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
					let suggestion = await server.analyzeMove(cornerCoords[i]);
					if (custom.isPreMovesStopped) break;

					await board.play(suggestion, "Corner pre move");
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

	if (!custom.isPassed) {
	custom.givePlayerControl();
	}
};

custom.boardEditorListener = async function(event) {
	if (event.markupChange && event.mark == 4 && custom.isPlayerControlling && !board.sgf.isSGFLoading) {
		custom.takePlayerControl();

		let markupCoord = new Coord(event.x, event.y);
		board.removeMarkup(markupCoord);

        await custom.playerTurn(markupCoord);
    } else if (event.navChange) {
		stats.clearVisits();

		let currentMove = board.editor.getCurrent();
		if ((board.lastMove.moveNumber+1 != currentMove.moveNumber ||
				board.lastMove.navTreeY != currentMove.navTreeY)) {
			
			custom.suggestions = null;
			if (custom.suggestionsHistory[currentMove.navTreeY]) {
				custom.suggestions = custom.suggestionsHistory[currentMove.navTreeY][currentMove.moveNumber];
			}

			if (custom.suggestions) {
				stats.setVisits(custom.suggestions);
				board.drawCoords(custom.suggestions);
			}
	
			if (!event.treeChange && !custom.isJumped) {
				custom.isJumped = true;
				custom.isPassed = false;
	
				board.disableNextButton();
				custom.givePlayerControl(false);
			}
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
	await custom.opponentTurn();
};

custom.playerTurn = async function(markupCoord) {
	let playerTurnId = ++custom.playerTurnId;
	
	if (custom.isJumped) {
		custom.isJumped = false;
		await server.setBoard();
		if (playerTurnId != custom.playerTurnId) return;
		custom.suggestionsPromise = custom.analyze();
	}

	await custom.suggestionsPromise;
	if (custom.isPassed) return;
	if (playerTurnId != custom.playerTurnId) return;

	let suggestionToPlay = custom.suggestions[0];
	let isRightChoice = false;
	let isPerfectChoice = false;
	for (let i=0; i<custom.suggestions.length; i++) {
		if (markupCoord.compare(custom.suggestions[i].coord)) {
			if (i == 0 || custom.suggestions[i].visits == custom.suggestions[0].visits) {
				isPerfectChoice = true;
			}

			isRightChoice = true;
			suggestionToPlay = custom.suggestions[i];
			break;
		}
	}

	if (settings.hideWeakerOptions && suggestionToPlay) {
		let suggestions = custom.suggestions;
		custom.suggestions = [];
		for (let i=0; i<suggestions.length; i++) {
			custom.suggestions.push(suggestions[i]);
			if (suggestions[i].coord.compare(markupCoord)) {
				break;
			}
		}

		custom.updateSuggestionsHistory();
	}
	
	let opponentOptions = 1;
	if (settings.opponentOptionsSwitch) {
		if ((utils.randomInt(100) + 1) <= settings.opponentOptionPerc) {
			opponentOptions = settings.opponentOptions;
		}
	}

	if (!settings.disableAICorrection || isRightChoice) {
		await board.play(suggestionToPlay, "Player");

		if (!isRightChoice) await board.draw(markupCoord, "cross");

		custom.suggestionsPromise = custom.analyze({ maxVisits: settings.opponentVisits, moveOptions: opponentOptions });
	} else {
		await board.draw(markupCoord, "auto", false, "Player");
	}

	stats.setVisits(custom.suggestions);
	stats.updateRatio(isRightChoice, isPerfectChoice);

	if (!settings.skipNextButton) {
		board.drawCoords(custom.suggestions);
	}

	if (settings.disableAICorrection && !isRightChoice) {
		stats.scoreChart.update(await server.analyzeMove(markupCoord));
		await server.play(markupCoord);

		custom.suggestionsPromise = custom.analyze({ maxVisits: settings.opponentVisits, moveOptions: opponentOptions });
	}

	if (!settings.skipNextButton) {
		board.enableNextButton();
	} else {
		await custom.nextButtonClickListener();
	}
};

custom.opponentTurn = async function() {
	let opponentTurnId = ++custom.opponentTurnId;

	await custom.suggestionsPromise;
	if (custom.isPassed) return;
	if (opponentTurnId != custom.opponentTurnId) return;

	if (settings.skipNextButton) {
		board.drawCoords(custom.suggestions);
	}

	await board.play(custom.suggestions[utils.randomInt(custom.suggestions.length)], "Opponent");

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

		custom.selfplayPromise = custom.selfplay();
	} else {
		custom.isSelfplay = false;
		custom.selfplayButton.innerHTML = "Start selfplay";

		await custom.selfplayPromise;

		if (!custom.isPassed) {
			custom.givePlayerControl();
		}
	}
};
custom.selfplayButton.addEventListener("click", custom.selfplayButtonClickListener);

custom.selfplay = async function() {
	while (custom.isSelfplay || settings.color != board.getNextColor()) {
		await custom.analyze({ maxVisits: settings.selfplayVisits, moveOptions: 1 });
		if (custom.isPassed) {
			custom.selfplayButton.click();
			return;
		}

		if (!custom.isSelfplay && settings.color == board.getNextColor()) return;

		await board.play(custom.suggestions[0], "Selfplay");
	}
};


(function () {

	custom.init();

})();

custom.createCommentGrades = function() {
	comment = "";
	for (let i=0; i<custom.suggestions.length; i++) {
		let suggestion = custom.suggestions[i];
        if (i != 0 && suggestion.visits == custom.suggestions[i - 1].visits) continue;

		comment += "\n" + suggestion.grade + ": " + suggestion.visits;
	}

	return comment;
}

custom.createPreMoveComment = function() {
	return "Pre move" +
	"\nOptions: " + settings.preOptions +
	custom.createCommentGrades();
}