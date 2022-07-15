(function () {

const playMove = new Event("playMove");

var bestCoord;

document.addEventListener("playMove", main);

async function init() {
	await server.restart();
}

function main(event) {
}

async function play(color, index = 0) {
	let moves = await server.analyze(color);
	let coord = moves[index];
	await server.play(coord["x"], coord["y"], color);
	board.place(coord["x"], coord["y"]);
}

async function turn(x, y) {
	await server.play(x, y, -1);
	let coord = await server.genmove(1);
	board.place(coord["x"], coord["y"]);
}

async function createPreMoves() {
	for (let i=0; i<4; i++) {
		await play(-1, utils.randomInt(3));
		await play(1, utils.randomInt(3));
	}
	bestCoord = await server.analyze(-1)[0];
}

init();
createPreMoves();

})();