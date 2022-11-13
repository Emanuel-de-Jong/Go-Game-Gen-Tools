var board = {};


board.init = function() {
	board.clear();
};

board.clear = function() {
	board.element = document.getElementById("board");
	besogo.create(board.element, {
		resize: "fixed",
		panels: "tree",
		coord: "western",
		tool: "navOnly",
		size: settings.boardsize,
		variants: 2,
		nowheel: true
	});

	board.editor = board.element.besogoEditor;

	board.lastMove = board.editor.getCurrent();
};

board.play = async function(suggestion, tool = "auto") {
	await board.draw(suggestion.coord, tool, true);
};

board.draw = async function(coord, tool = "auto", sendToServer = true) {
	board.editor.setTool(tool);
	board.editor.click(coord.x, coord.y, false, false);
	board.editor.setTool("navOnly");

	if (tool == "auto" || tool == "playB" || tool == "playW") {
		board.lastMove = board.editor.getCurrent();

		if (sendToServer) {
			if (tool == "auto") {
				await server.play(coord);
			} else if (tool == "playB") {
				await server.play(coord, -1);
			} else if (tool == "playW") {
				await server.play(coord, 1);
			}
		}
	}
};

board.getColor = function() {
	let currentMove = board.editor.getCurrent();
	if (currentMove.move != null) {
		return currentMove.move.color
	}
	return 1;
};

board.getNextColor = function() {
	let currentMove = board.editor.getCurrent();
	if (currentMove.move != null) {
		if (currentMove.children.length > 0) {
			return currentMove.children[0].move.color;
		}
		return currentMove.move.color * -1;
	}
	return -1;
};

board.getMoves = function() {
	let moves = [];
	let node = board.editor.getCurrent();
	while (node.moveNumber != 0) {
		moves.push({
			color: node.move.color,
			coord: new Coord(
				node.move.x,
				node.move.y
			)
		});

		node = node.parent;
	}

	moves = moves.reverse();
	return moves;
};