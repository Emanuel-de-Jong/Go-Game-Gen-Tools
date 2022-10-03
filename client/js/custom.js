var custom = {};

custom.restartButton = document.getElementById("restart");
custom.selfplayButton = document.getElementById("selfplay");

custom.suggestionReadyEvent = new Event("suggestionReady");

custom.bestSuggestions;
custom.opponentBestSuggestionsPromise;
custom.isPlayerControlling = false;
custom.isJumped = false;
custom.isFinished = false;
custom.isSelfplay = false;
custom.selfplayPromise;

custom.init = async function() {
	await server.init();

	stats.init();

	await board.init();
	board.editor.addListener(custom.boardEditorListener);
	board.nextButton.addEventListener("click", custom.nextButtonClickListener);

	await custom.createPreMoves();
};

custom.finish = async function(suggestion) {
	custom.isFinished = true;
	custom.takePlayerControl();
	board.disableNextButton();
	stats.updateResult(suggestion);
};

custom.analyze = async function(color = board.nextColor(), moveOptions = settings.moveOptions) {
	let suggestions = await server.analyze(color, moveOptions);
	if (suggestions[0].coord == "pass") {
		custom.finish(suggestions[0]);
	}
	return suggestions;
};

custom.playPreMove = async function(color) {
	let suggestions = await custom.analyze(color, settings.preOptions);
	if (custom.isFinished) return;
	await board.play(suggestions[utils.randomInt(suggestions.length)]);
};

custom.createPreMoves = async function() {
	let preMovesLeft = settings.preMoves;

	if (settings.handicap == 0 && settings.boardsize == 19) {
		let cornerCount = preMovesLeft < 4 ? preMovesLeft : 4;
		let cornerCoords = board.fillCorners();
		for (let i=0; i<cornerCount; i++) {
			await board.draw(cornerCoords[i]);
			preMovesLeft--;
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

	await custom.getBestSuggestions();
};

custom.boardEditorListener = async function(event) {
	if (event.markupChange === true && custom.isPlayerControlling) {
		custom.takePlayerControl();
        await custom.playerTurn();
    } else if (event.navChange === true) {
		let currentMove = board.editor.getCurrent();
		if (board.lastMove.moveNumber+1 != currentMove.moveNumber ||
				board.lastMove.navTreeY != currentMove.navTreeY) {
			custom.isJumped = true;
			custom.isFinished = false;

			board.disableNextButton();
			custom.givePlayerControl();
		}
	}
};

custom.givePlayerControl = async function() {
	board.editor.setTool("cross");
	custom.isPlayerControlling = true;
};

custom.takePlayerControl = async function() {
	board.editor.setTool("navOnly");
	custom.isPlayerControlling = false;
};

custom.nextButtonClickListener = async function() {
	board.disableNextButton();
	await custom.botTurn();
};

custom.getBestSuggestions = async function() {
	custom.bestSuggestions = await custom.analyze();
	if (custom.isFinished) return;
	custom.givePlayerControl();
	document.dispatchEvent(custom.suggestionReadyEvent);
};

custom.getOpponentBestSuggestions = function() {
	custom.opponentBestSuggestionsPromise = custom.analyze();
};

custom.playerTurn = async function() {
	if (custom.isJumped) {
		custom.isJumped = false;
		await server.setBoard();
		custom.bestSuggestions = await custom.analyze();
		if (custom.isFinished) return;
	}

	let suggestionToPlay = custom.bestSuggestions[0];
	let markupCoord = board.getMarkupCoord();
	let isRightChoice = false;
	let isPerfectChoice = false;
	for (let i=0; i<custom.bestSuggestions.length; i++) {
		if (markupCoord.compare(custom.bestSuggestions[i].coord)) {
			if (i == 0) {
				isPerfectChoice = true;
			}

			isRightChoice = true;
			suggestionToPlay = custom.bestSuggestions[i];
			break;
		}
	}
	
	if (!settings.disableAICorrection) {
		await board.play(suggestionToPlay);
	} else {
		await board.draw(markupCoord);
	}

	custom.getOpponentBestSuggestions();

	board.drawCoords(custom.bestSuggestions);
	if (!isRightChoice) {
		await board.draw(markupCoord, "cross");
	}

	stats.updateRatio(isRightChoice, isPerfectChoice);
	stats.setVisits(custom.bestSuggestions);

	if (!settings.skipNextButton) {
		board.enableNextButton();
	} else {
		await custom.nextButtonClickListener();
	}
};

custom.botTurn = async function() {
	let suggestions = await custom.opponentBestSuggestionsPromise;
	if (custom.isFinished) return;
	await board.play(suggestions[0]);

	await custom.getBestSuggestions();
};

custom.restartButton.addEventListener("click", async () => {
	settings.update();

	stats.scoreChart.destroy();
	
	await custom.init();
});

custom.selfplayButtonClickListener = async function() {
	if (custom.isSelfplay) {
		custom.isSelfplay = false;
		custom.selfplayButton.innerHTML = "Start selfplay";

		await custom.selfplayPromise;
		custom.bestSuggestions = await custom.analyze();
		custom.givePlayerControl();
	} else {
		custom.isSelfplay = true;
		custom.selfplayButton.innerHTML = "Stop selfplay";

		custom.takePlayerControl();
		board.disableNextButton();
		custom.selfplayPromise = custom.selfplay();
	}
};
custom.selfplayButton.addEventListener("click", custom.selfplayButtonClickListener);

custom.selfplay = async function() {
	while (custom.isSelfplay || settings.color != board.nextColor()) {
		let suggestions = await custom.analyze();
		if (custom.isFinished) {
			custom.isSelfplay = false;
			custom.selfplayButton.innerHTML = "Start selfplay";
			return;
		}

		board.play(suggestions[0]);
	}
};


(function () {

	custom.init();

})();