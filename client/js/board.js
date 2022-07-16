var board = {};

(function () {

board.create = async function() {
	board.element = document.querySelector("#board");
	besogo.create(board.element, {
		resize: "fixed",
		panels: "control+tree+file",
		coord: "western",
		tool: "navOnly",
		size: options.boardsize,
		variants: 1
	});

	board.editor = board.element.besogoEditor;
	
	document.querySelector('button[title="Variants: child/[sibling]"]').remove();
	document.querySelector('button[title="Variants: [show]/hide"]').remove();
	document.querySelector('input[value="9x9"]').remove();
	document.querySelector('input[value="13x13"]').remove();
	document.querySelector('input[value="19x19"]').remove();
	document.querySelector('input[value="?x?"]').remove();
	
	document.querySelector(".besogo-board")
		.insertAdjacentHTML("beforeend", '<button type="button" class="btn btn-secondary" id="next" disabled>></button>');

	await board.handicap();
};

board.getTree = function() {
	let root = board.editor.getRoot();
	if (root.children.length == 0) {
		return [];
	}

	let node = root.children[0];
	let tree = [];
	let isLastChild = false;
	while (!isLastChild) {
		tree.push({
			color: node.move.color,
			coord: {
				x: node.move.x,
				y: node.move.y
			}
		});

		if (node.children.length == 0) {
			isLastChild = true;
			break;
		}
		node = node.children[0];
	}

	return tree;
}

board.draw = function(coord, tool = "auto") {
	board.editor.setTool(tool);
	board.editor.click(coord.x, coord.y, false, false);
	board.editor.setTool("navOnly");

	// if (tool === "auto") {
	// 	document.dispatchEvent(playMove);
	// }
};

board.drawCoords = function(coords) {
	board.editor.setTool("label");
	board.editor.setLabel("A");
	coords.forEach(coord => {
		board.editor.click(coord.x, coord.y, false, false);
	});
	board.editor.setTool("navOnly");
}

board.markupToCoord = function() {
	let markup = board.editor.getCurrent().markup;
	let markupNum;
	for (let i=0; i<markup.length; i++) {
		if (markup[i] == 4) {
			markupNum = i;
			break;
		}
	}

	return {
		x: Math.floor(markupNum / options.boardsize) + 1,
		y: (markupNum % options.boardsize) + 1
	}
}

board.handicap = async function() {
	let placement = {
		19: {
			0: [],
			2: [ {x:16,y:4}, {x:4,y:16} ],
			3: [ {x:16,y:4}, {x:4,y:16}, {x:16,y:16} ],
			4: [ {x:4,y:4}, {x:16,y:4}, {x:4,y:16}, {x:16,y:16} ],
			5: [ {x:4,y:4}, {x:16,y:4}, {x:10,y:10}, {x:4,y:16}, {x:16,y:16} ],
			6: [ {x:4,y:4}, {x:16,y:4}, {x:4,y:10}, {x:16,y:10}, {x:4,y:16}, {x:16,y:16} ],
			7: [ {x:4,y:4}, {x:16,y:4}, {x:4,y:10}, {x:10,y:10}, {x:16,y:10}, {x:4,y:16}, {x:16,y:16} ],
			8: [ {x:4,y:4}, {x:10,y:4}, {x:16,y:4}, {x:4,y:10}, {x:16,y:10}, {x:4,y:16}, {x:10,y:16}, {x:16,y:16} ],
			9: [ {x:4,y:4}, {x:10,y:4}, {x:16,y:4}, {x:4,y:10}, {x:10,y:10}, {x:16,y:10}, {x:4,y:16}, {x:10,y:16}, {x:16,y:16} ],
		},
		13: {
			0: [],
			2: [ {x:10,y:4}, {x:4,y:10} ],
			3: [ {x:10,y:4}, {x:4,y:10}, {x:10,y:10} ],
			4: [ {x:4,y:4}, {x:10,y:4}, {x:4,y:10}, {x:10,y:10} ],
			5: [ {x:4,y:4}, {x:10,y:4}, {x:7,y:7}, {x:4,y:10}, {x:10,y:10} ],
			6: [ {x:4,y:4}, {x:10,y:4}, {x:4,y:7}, {x:10,y:7}, {x:4,y:10}, {x:10,y:10} ],
			7: [ {x:4,y:4}, {x:10,y:4}, {x:4,y:7}, {x:7,y:7}, {x:10,y:7}, {x:4,y:10}, {x:10,y:10} ],
			8: [ {x:4,y:4}, {x:7,y:4}, {x:10,y:4}, {x:4,y:7}, {x:10,y:7}, {x:4,y:10}, {x:7,y:10}, {x:10,y:10} ],
			9: [ {x:4,y:4}, {x:7,y:4}, {x:10,y:4}, {x:4,y:7}, {x:7,y:7}, {x:10,y:7}, {x:4,y:10}, {x:7,y:10}, {x:10,y:10} ],
		},
		9: {
			0: [],
			2: [ {x:7,y:3}, {x:3,y:7} ],
			3: [ {x:7,y:3}, {x:3,y:7}, {x:7,y:7} ],
			4: [ {x:3,y:3}, {x:7,y:3}, {x:3,y:7}, {x:7,y:7} ],
			5: [ {x:3,y:3}, {x:7,y:3}, {x:5,y:5}, {x:3,y:7}, {x:7,y:7} ],
			6: [ {x:3,y:3}, {x:7,y:3}, {x:5,y:5}, {x:3,y:7}, {x:7,y:7} ],
			7: [ {x:3,y:3}, {x:7,y:3}, {x:5,y:5}, {x:3,y:7}, {x:7,y:7} ],
			8: [ {x:3,y:3}, {x:7,y:3}, {x:5,y:5}, {x:3,y:7}, {x:7,y:7} ],
			9: [ {x:3,y:3}, {x:7,y:3}, {x:5,y:5}, {x:3,y:7}, {x:7,y:7} ],
		},
	}

	placement[options.boardsize][options.handicap].forEach(async (coord) => {
		board.draw(coord, "playB");
		await server.play(coord, -1);
	});
}

})();