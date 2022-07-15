(function () {

const PRE_MOVE_OPTIONS = 3;

var bestCoords;
var isPlayerControlling = false;
var nextButton = document.querySelector('#next');

async function init() {
	await server.restart();
}

async function createPreMoves() {
	let coords;
	for (let i=0; i<options.preMoves/2; i++) {
		coords = await server.analyze(-1, PRE_MOVE_OPTIONS, options.preStrength);
		await play(-1, utils.randomInt(PRE_MOVE_OPTIONS), coords);
		coords = await server.analyze(1, PRE_MOVE_OPTIONS, options.preStrength);
		await play(1, utils.randomInt(PRE_MOVE_OPTIONS), coords);
	}
	await getBestCoords();
}

board.editor.addListener((event) => {
    if (event.markupChange === true && isPlayerControlling) {
		isPlayerControlling = false;
        playerTurn();
    }
});

nextButton.addEventListener("click", () => {
	nextButton.disabled = true;
	botTurn();
})

async function play(color, index = 0, coords) {
	if (coords == null) {
		coords = await server.analyze(color);
	}

	let coord = coords[index];
	board.draw(coord);
	await server.play(coord, color);
}

async function getBestCoords() {
	bestCoords = await server.analyze(-1);
	board.editor.setTool("cross");
	isPlayerControlling = true;
}

async function playerTurn() {
	let markupCoord = board.markupToCoord();
	let isCorrectChoice = false;
	for (let i=0; i<bestCoords.length; i++) {
		if (utils.compCoord(markupCoord, bestCoords[i])) {
			isCorrectChoice = true;
			await play(-1, i, bestCoords);
			break;
		}
	}

	if (!isCorrectChoice) {
		await play(-1, 0, bestCoords);
	}

	board.drawCoords(bestCoords);
	if (!isCorrectChoice) {
		board.draw(markupCoord, "cross");
	}

	nextButton.disabled = false;
}

async function botTurn() {
	await play(1);
	await getBestCoords();
}

init();
createPreMoves();

})();