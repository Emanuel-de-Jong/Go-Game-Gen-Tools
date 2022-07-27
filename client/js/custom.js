var custom = {};

custom.PRE_MOVE_OPTIONS = 3;

custom.suggestionReadyEvent = new Event("suggestionReady");

custom.bestCoords;
custom.opponentBestCoordsPromise;
custom.isPlayerControlling = false;
custom.isJumped = false;

custom.init = async function() {
	await server.init();

	await board.init();
	board.editor.addListener(custom.boardEditorListener);
	board.nextButton.addEventListener("click", custom.nextButtonClickListener);

	await custom.createPreMoves();
};

custom.playPreMove = async function(color) {
	let coords = await server.analyze(color, options.preStrength, custom.PRE_MOVE_OPTIONS);
	await board.draw(coords[utils.randomInt(custom.PRE_MOVE_OPTIONS)]);
};

custom.createPreMoves = async function() {
	let generatedPreMoves = options.preMoves/2;

	if (options.handicap == 0) {
		generatedPreMoves -= 2;

		let cornerCoords = board.fillCorners();
		for (let i=0; i<4; i++) {
			await board.draw(cornerCoords[i]);
		}
	}

	for (let i=0; i<generatedPreMoves; i++) {
		if (i != 0 || options.handicap == 0) {
			await custom.playPreMove(-1);
		}
		await custom.playPreMove(1);
	}

	if (options.color == 1) {
		await custom.playPreMove(-1);
	}

	await custom.getBestCoords();
};

custom.boardEditorListener = async function(event) {
	if (event.markupChange === true && custom.isPlayerControlling) {
		custom.isPlayerControlling = false;
        await custom.playerTurn();
    } else if (event.navChange === true) {
		let currentMove = board.editor.getCurrent();
		if (board.lastMove.moveNumber+1 != currentMove.moveNumber ||
			board.lastMove.navTreeY != currentMove.navTreeY) {
				custom.isJumped = true;
		}
	}
};

custom.nextButtonClickListener = async function() {
	board.disableNextButton();
	await custom.botTurn();
};

custom.getBestCoords = async function() {
	custom.bestCoords = await server.analyze(board.nextColor(), options.suggestionStrength);
	board.editor.setTool("cross");
	custom.isPlayerControlling = true;
	document.dispatchEvent(custom.suggestionReadyEvent);
};

custom.getOpponentBestCoords = function() {
	custom.opponentBestCoordsPromise = server.analyze(board.nextColor(), options.opponentStrength);
};

custom.playerTurn = async function() {
	if (custom.isJumped) {
		custom.isJumped = false;
		board.editor.setTool("navOnly");
		await server.setBoard();
		custom.bestCoords = await server.analyze(board.nextColor(), options.suggestionStrength);
	}

	let markupCoord = board.markupToCoord();
	let isRightChoice = false;
	let isPerfectChoice = false;
	for (let i=0; i<custom.bestCoords.length; i++) {
		if (utils.compCoord(markupCoord, custom.bestCoords[i])) {
			if (i == 0) {
				isPerfectChoice = true;
			}

			isRightChoice = true;
			await board.draw(custom.bestCoords[i]);
			break;
		}
	}

	if (!isRightChoice) {
		await board.draw(custom.bestCoords[0]);
	}

	custom.getOpponentBestCoords();

	board.drawCoords(custom.bestCoords);
	if (!isRightChoice) {
		await board.draw(markupCoord, "cross");
	}

	board.enableNextButton();

	options.updateStats(isRightChoice, isPerfectChoice);
};

custom.botTurn = async function() {
	let coords = await custom.opponentBestCoordsPromise;
	await board.draw(coords[0]);

	await custom.getBestCoords();
};

document.getElementById("restart").addEventListener("click", async () => {
	options.update();
	await custom.init();
});


(function () {

	custom.init();

})();