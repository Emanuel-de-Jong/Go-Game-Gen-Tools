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

custom.stopPreMovesButton.addEventListener("click", () => {
	custom.isPreMovesStopped = true;
});

custom.finish = async function(suggestion) {
	custom.isFinished = true;
	custom.takePlayerControl();
	board.disableNextButton();
	
	let result = stats.updateResult(suggestion);
	board.sgf.setResult(result);
};

custom.analyze = async function({
		maxVisits = settings.suggestionStrength,
		moveOptions = settings.moveOptions,
		minVisits = settings.minVisits,
		color = board.nextColor()
	} = {}) {
	let suggestions = await server.analyze(maxVisits, color, moveOptions, minVisits);
	if (suggestions[0].coord == "pass") {
		custom.finish(suggestions[0]);
	}
	return suggestions;
};

custom.playPreMove = async function() {
	let suggestions = await custom.analyze({ maxVisits: settings.preStrength, moveOptions: settings.preOptions, minVisits: 25});
	if (custom.isFinished) custom.isPreMovesStopped = true;
	if (custom.isPreMovesStopped) return;
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

	for (let i=0; i<preMovesLeft; i++) {
		if (custom.isPreMovesStopped) break;
		await custom.playPreMove();
	}

	if (settings.color == board.lastColor()) {
		await custom.playPreMove();
	}

	custom.stopPreMovesButton.hidden = true;
	custom.selfplayButton.hidden = false;

	if (!custom.isFinished) {
		custom.givePlayerControl();
	}
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

custom.givePlayerControl = async function(isSuggestionNeeded = true) {
	board.editor.setTool("cross");
	custom.isPlayerControlling = true;
	if (isSuggestionNeeded) {
		custom.suggestionsPromise = custom.analyze();
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
		custom.suggestionsPromise = custom.analyze();
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

	custom.suggestionsPromise = custom.analyze({ maxVisits: settings.opponentStrength, moveOptions: 1 });

	custom.createSuggestionsToShow(suggestions, markupCoord);
	stats.updateRatio(isRightChoice, isPerfectChoice);
	stats.setVisits(custom.suggestionsToShow);

	if (!settings.skipNextButton) {
		board.drawCoords(custom.suggestionsToShow);
		board.enableNextButton();
	} else {
		await custom.nextButtonClickListener();
	}
};

custom.createSuggestionsToShow = function(suggestions, playedCoord) {
	custom.suggestionsToShow = [];
	for (let i=0; i<suggestions.length; i++) {
		custom.suggestionsToShow.push(suggestions[i])
		if (settings.hideWeakerOptions && suggestions[i].coord.compare(playedCoord)) {
			break;
		}
	}
};

custom.botTurn = async function() {
	let suggestions = await custom.suggestionsPromise;
	if (custom.isFinished) return;

	if (settings.skipNextButton) {
		board.drawCoords(custom.suggestionsToShow);
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
		let suggestions = await custom.analyze({ maxVisits: settings.selfplayStrength, moveOptions: 1 });
		if (custom.isFinished) {
			custom.selfplayButton.click();
			return;
		}

		if (!custom.isSelfplay && settings.color == board.nextColor()) return;

		board.play(suggestions[0]);
	}
};


(function () {

	custom.init();

})();