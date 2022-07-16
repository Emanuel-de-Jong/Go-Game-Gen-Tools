(function () {

const PRE_MOVE_OPTIONS = 3;

var bestCoords;
var isPlayerControlling = false;
var nextButton;

async function init() {
	await server.restart();
	server.setRules(options.ruleset);
	server.setKomi(options.komi);

	board.editor.addListener(boardEditorListener);
	nextButton = document.querySelector('#next');
	nextButton.addEventListener("click", nextButtonClickListener);

	createPreMoves();
}

async function playPreMove(color) {
	let coords = await server.analyze(color, PRE_MOVE_OPTIONS, options.preStrength);
	await play(color, utils.randomInt(PRE_MOVE_OPTIONS), coords);
}

async function createPreMoves() {
	for (let i=0; i<options.preMoves/2; i++) {
		await playPreMove(-1);
		await playPreMove(1);
	}

	if (options.color == 1) {
		await playPreMove(-1);
	}

	await getBestCoords();
}

async function boardEditorListener(event) {
	if (event.markupChange === true && isPlayerControlling) {
		isPlayerControlling = false;
        await playerTurn();
    }
}

async function nextButtonClickListener() {
	nextButton.disabled = true;
	await botTurn();
}

document.querySelector('#restart').addEventListener("click", async () => {
	options.update();
	board.create();
	await init();
});

async function play(color, index = 0, coords) {
	if (coords == null) {
		coords = await server.analyze(color);
	}

	let coord = coords[index];
	board.draw(coord);
	await server.play(coord, color);
}

async function getBestCoords() {
	bestCoords = await server.analyze(options.color);
	board.editor.setTool("cross");
	isPlayerControlling = true;
}

async function playerTurn() {
	let markupCoord = board.markupToCoord();
	let isCorrectChoice = false;
	for (let i=0; i<bestCoords.length; i++) {
		if (utils.compCoord(markupCoord, bestCoords[i])) {
			isCorrectChoice = true;
			await play(options.color, i, bestCoords);
			break;
		}
	}

	if (!isCorrectChoice) {
		await play(options.color, 0, bestCoords);
	}

	board.drawCoords(bestCoords);
	if (!isCorrectChoice) {
		board.draw(markupCoord, "cross");
	}

	nextButton.disabled = false;

	options.updateStats(isCorrectChoice);
}

async function botTurn() {
	await play(options.botColor);
	await getBestCoords();
}

init();

})();