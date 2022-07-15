(function () {

	const playMove = new Event("playMove");

	var bestCoord;

	document.addEventListener("playMove", main);

	async function init() {
		await server.restart();
	}

	function main(event) {
	}

	let board = document.querySelector("#board");
	besogo.create(board, { resize: "fixed", panels: "control+tree+file" });

	document.querySelector("input[value=\"9x9\"]").remove();
	document.querySelector("input[value=\"13x13\"]").remove();
	document.querySelector("input[value=\"19x19\"]").remove();
	document.querySelector("input[value=\"?x?\"]").remove();

	document.querySelector("button[title=\"Previous node\"]")
		.insertAdjacentHTML("afterend", "<span id=\"moveCount\">0</span>");

	let editor = board.besogoEditor;
	editor.toggleCoordStyle();
	editor.toggleCoordStyle();
	editor.setTool("cross");
	
	editor.addListener((event) => {
		if (event.markupChange === true) {
			let markup = editor.getCurrent().markup;
			let markupNum;
			for (let i=0; i<markup.length; i++) {
				if (markup[i] == 4) {
					markupNum = i;
					break;
				}
			}
			console.log(markupNum);
			let coord = {
				x: Math.floor(markupNum / 19) + 1,
				y: (markupNum % 19) + 1
			}
			console.log(coord);

			// let move = editor.getCurrent().move;
			// if (move.color == -1) {
			// 	// turn(move.x, move.y)
			// 	place(bestCoord["x"], bestCoord["y"]);
			// }
		}
	})

	function place(x, y, tool = "auto") {
		editor.setTool(tool);
		editor.click(x, y, false, false);

		if (tool === "auto") {
			document.dispatchEvent(playMove);
		}

		editor.setTool("cross");
	}

	async function play(color, index = 0) {
		let moves = await server.analyze(color);
		let coord = moves[index];
		await server.play(coord["x"], coord["y"], color);
		place(coord["x"], coord["y"]);
	}

	async function turn(x, y) {
		await server.play(x, y, -1);
		let coord = await server.genmove(1);
		place(coord["x"], coord["y"]);
	}

	async function createPreMoves() {
		for (let i=0; i<6; i++) {
			await play(-1, utils.randomInt(3));
			await play(1, utils.randomInt(3));
		}
		bestCoord = await server.analyze(-1)[0];
	}

	init();
	createPreMoves();
})();