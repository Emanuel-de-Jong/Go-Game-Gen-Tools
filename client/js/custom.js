var custom = {};

custom.restartButton = document.getElementById("restart");
custom.selfplayButton = document.getElementById("selfplay");

custom.init = async function() {
	await custom.clear(utils.SOURCE.CUSTOM);
};

custom.clear = async function(source) {
	custom.suggestionsPromise = null;
	custom.prevSuggestions = null;
	custom.selfplayPromise = null;
	custom.isPlayerControlling = false;
	custom.isJumped = false;
	custom.isFinished = false;
	custom.isSelfplay = false;

	if (source !== utils.SOURCE.SERVER) await server.init();

	if (source !== utils.SOURCE.STATS) stats.init();

	if (source !== utils.SOURCE.BOARD) {
		await board.init();
		board.editor.addListener(custom.boardEditorListener);
		board.nextButton.addEventListener("click", custom.nextButtonClickListener);
		await custom.createPreMoves();
	}
};

custom.finish = async function(suggestion) {
	custom.isFinished = true;
	custom.takePlayerControl();
	board.disableNextButton();
	
	let result = stats.updateResult(suggestion);
	board.sgf.setResult(result);
};

custom.analyze = async function(maxVisits = settings.suggestionStrength, color = board.nextColor(), moveOptions = settings.moveOptions) {
	let suggestions = await server.analyze(maxVisits, color, moveOptions);
	if (suggestions[0].coord == "pass") {
		custom.finish(suggestions[0]);
	}
	return suggestions;
};

custom.playPreMove = async function(color) {
	let suggestions = await custom.analyze(settings.preStrength, color, settings.preOptions);
	if (custom.isFinished) return;
	await board.play(suggestions[utils.randomInt(suggestions.length)]);
};

custom.createPreMoves = async function() {
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
				await board.draw(cornerCoords[i]);
				preMovesLeft--;
			}
		}
	}

	let lastColor = board.lastColor();
	for (let i=0; i<preMovesLeft; i++) {
		if (lastColor == -1) {
			lastColor = 1;
			await custom.playPreMove(1);
		} else {
			lastColor = -1;
			await custom.playPreMove(-1);
		}
	}

	if (settings.color == board.lastColor()) {
		await custom.playPreMove(board.nextColor());
	}

	custom.givePlayerControl();
};

custom.boardEditorListener = async function(event) {
	if (event.markupChange === true && custom.isPlayerControlling && !board.sgf.isSGFLoading) {
		custom.takePlayerControl();
        await custom.playerTurn();
    } else if (event.navChange === true) {
		let currentMove = board.editor.getCurrent();
		if (board.lastMove.moveNumber+1 != currentMove.moveNumber ||
				board.lastMove.navTreeY != currentMove.navTreeY) {
			custom.isJumped = true;
			custom.isFinished = false;

			stats.clearScoreChart();

			board.disableNextButton();
			custom.givePlayerControl(false);
		}
	}
};

custom.setSuggestionsPromise = async function(maxVisits = settings.suggestionStrength) {
	if (custom.suggestionsPromise) {
		custom.prevSuggestions = await custom.suggestionsPromise;
	}
	custom.suggestionsPromise = custom.analyze(maxVisits);
};

custom.givePlayerControl = async function(isSuggestionNeeded = true) {
	board.editor.setTool("cross");
	custom.isPlayerControlling = true;
	if (isSuggestionNeeded) {
		custom.setSuggestionsPromise();
	}
};

custom.takePlayerControl = async function() {
	board.editor.setTool("navOnly");
	custom.isPlayerControlling = false;
};

custom.nextButtonClickListener = async function() {
	board.disableNextButton();
	await custom.botTurn();
};

custom.playerTurn = async function() {
	if (custom.isJumped) {
		custom.isJumped = false;
		await server.setBoard();
		custom.setSuggestionsPromise();
	}

	let suggestions = await custom.suggestionsPromise;
	if (custom.isFinished) return;

	let suggestionToPlay = suggestions[0];
	let markupCoord = board.getMarkupCoord();
	let isRightChoice = false;
	let isPerfectChoice = false;
	for (let i=0; i<suggestions.length; i++) {
		if (markupCoord.compare(suggestions[i].coord)) {
			if (i == 0) {
				isPerfectChoice = true;
			}

			isRightChoice = true;
			suggestionToPlay = suggestions[i];
			break;
		}
	}
	
	if (!settings.disableAICorrection) {
		await board.play(suggestionToPlay);
		if (!isRightChoice) await board.draw(markupCoord, "cross");
	} else {
		await board.draw(markupCoord);
	}

	custom.setSuggestionsPromise(settings.opponentStrength);

	stats.updateRatio(isRightChoice, isPerfectChoice);
	stats.setVisits(suggestions);

	if (!settings.skipNextButton) {
		board.drawCoords(suggestions);
		board.enableNextButton();
	} else {
		await custom.nextButtonClickListener();
	}
};

custom.botTurn = async function() {
	let suggestions = await custom.suggestionsPromise;
	if (custom.isFinished) return;

	if (settings.skipNextButton) {
		board.drawCoords(custom.prevSuggestions);
	}
	
	await board.play(suggestions[0]);

	custom.givePlayerControl();
};

custom.restartButton.addEventListener("click", async () => {
	await custom.clear(utils.SOURCE.CUSTOM);
});

custom.selfplayButton.addEventListener("click", async () => {
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

		if (!custom.isFinished) {
			custom.givePlayerControl();
		}
	}
});

custom.selfplay = async function() {
	while (custom.isSelfplay || settings.color != board.nextColor()) {
		let suggestions = await custom.analyze(settings.selfplayStrength);
		if (custom.isFinished) {
			custom.selfplayButton.click();
			return;
		}

		board.play(suggestions[0]);
	}
};


(function () {

	custom.init();

})();