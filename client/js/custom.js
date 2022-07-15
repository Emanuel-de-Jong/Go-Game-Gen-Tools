(function () {

var bestCoords;

async function init() {
	await server.restart();
}

async function createPreMoves() {
	for (let i=0; i<1; i++) {
		await play(-1, utils.randomInt(3));
		await play(1, utils.randomInt(3));
	}
	await getBestCoords();
}

board.editor.addListener((event) => {
    if (event.markupChange === true) {
        turn();
    }
});

async function play(color, index = 0, coords) {
	if (coords == null) {
		coords = await server.analyze(color);
	}

	let coord = coords[index];
	board.place(coord);
	await server.play(coord, color);
}

async function getBestCoords() {
	bestCoords = await server.analyze(-1);
	board.editor.setTool("cross");
}

async function turn() {
	let markupCoord = board.markupToCoord();
	let correctChoice = false;
	for (let i=0; i<bestCoords.length; i++) {
		if (utils.compCoord(markupCoord, bestCoords[i])) {
			correctChoice = true;
			await play(-1, i, bestCoords);
			break;
		}
	}

	if (!correctChoice) {
		await play(-1, 0, bestCoords);
	}

	console.log(correctChoice);

	await play(1);
	await getBestCoords();
}

init();
createPreMoves();

})();