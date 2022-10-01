var custom = {};

custom.suggestionReadyEvent = new Event("suggestionReady");

custom.bestCoords;
custom.opponentBestCoordsPromise;
custom.isPlayerControlling = false;
custom.isJumped = false;
custom.isFinished = false;

custom.init = async function() {
	await server.init();

	stats.init();

	await board.init();
	board.editor.addListener(custom.boardEditorListener);
	board.nextButton.addEventListener("click", custom.nextButtonClickListener);

	await custom.createPreMoves();
};

custom.finish = async function() {
	custom.isFinished = true;
	custom.takePlayerControl();
	board.disableNextButton();
	alert("Finished!");
};

custom.analyze = async function(color = board.nextColor(), moveOptions = settings.moveOptions) {
	let coords = await server.analyze(color, moveOptions);
	if (coords == "pass") {
		custom.finish();
	}
	return coords;
};

custom.playPreMove = async function(color) {
	let coords = await custom.analyze(color, settings.preOptions);
	if (custom.isFinished) return;
	await board.draw(coords[utils.randomInt(coords.length)]);
};

custom.createPreMoves = async function() {
	let preMovesLeft = settings.preMoves;

	if (settings.handicap == 0) {
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

	await custom.getBestCoords();
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

custom.getBestCoords = async function() {
	custom.bestCoords = await custom.analyze();
	if (custom.isFinished) return;
	custom.givePlayerControl();
	document.dispatchEvent(custom.suggestionReadyEvent);
};

custom.getOpponentBestCoords = function() {
	custom.opponentBestCoordsPromise = custom.analyze();
};

custom.playerTurn = async function() {
	if (custom.isJumped) {
		custom.isJumped = false;
		await server.setBoard();
		custom.bestCoords = await custom.analyze();
		if (custom.isFinished) return;
	}

	let coordToPlay;
	let markupCoord = board.getMarkupCoord();
	let isRightChoice = false;
	let isPerfectChoice = false;
	for (let i=0; i<custom.bestCoords.length; i++) {
		if (utils.compCoord(markupCoord, custom.bestCoords[i])) {
			if (i == 0) {
				isPerfectChoice = true;
			}

			isRightChoice = true;
			coordToPlay = custom.bestCoords[i];
			break;
		}
	}

	if (!isRightChoice) {
		if (!settings.disableAICorrection) {
			coordToPlay = custom.bestCoords[0];
		} else {
			coordToPlay = markupCoord;
		}
	}

	await board.draw(coordToPlay);

	custom.getOpponentBestCoords();

	board.drawCoords(custom.bestCoords);
	if (!isRightChoice) {
		await board.draw(markupCoord, "cross");
	}

	board.enableNextButton();

	stats.update(isRightChoice, isPerfectChoice);
};

custom.botTurn = async function() {
	let coords = await custom.opponentBestCoordsPromise;
	if (custom.isFinished) return;
	await board.draw(coords[0]);

	await custom.getBestCoords();
};

document.getElementById("restart").addEventListener("click", async () => {
	settings.update();
	await custom.init();
});


(function () {

	custom.init();

})();