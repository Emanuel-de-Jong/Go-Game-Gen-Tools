var board = {};

board.HANDICAP_COORDS = {
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
};


board.init = function() {
	board.placeStoneAudios = [
		new Audio("resources/placeStone0.mp3"),
		new Audio("resources/placeStone1.mp3"),
		new Audio("resources/placeStone2.mp3"),
		new Audio("resources/placeStone3.mp3"),
		new Audio("resources/placeStone4.mp3")
	];
	board.lastPlaceStoneAudioIndex = 0;

	utils.addEventsListener(document, ["keydown", "mousedown"], board.keydownAndMousedownListener);
	
	board.clear();
};

board.clear = function() {
	board.element = document.getElementById("board");
	besogo.create(board.element, {
		resize: "fixed",
		panels: "control+names+tree+comment+file",
		coord: "western",
		tool: "navOnly",
		size: settings.boardsize,
		variants: 2,
		nowheel: true
	});

	board.editor = board.element.besogoEditor;
	
	document.querySelector('#game button[title="Variants: [child]/sibling"]').remove();
	document.querySelector('#game button[title="Variants: show/[hide]"]').remove();
	document.querySelector('#game input[value="9x9"]').remove();
	document.querySelector('#game input[value="13x13"]').remove();
	document.querySelector('#game input[value="19x19"]').remove();
	document.querySelector('#game input[value="?x?"]').remove();
	document.querySelector('#game input[value="Comment"]').remove();
	document.querySelector('#game input[value="Edit Info"]').remove();
	document.querySelector('#game input[value="Info"]').remove();
	
	document.querySelector("#game .besogo-board")
		.insertAdjacentHTML("beforeend", '<button type="button" class="btn btn-secondary" id="next" disabled>></button>');
	board.nextButton = document.getElementById("next");

	board.commentElement = document.querySelector('#game .besogo-comment textarea');

	board.lastMove = board.editor.getCurrent();

	board.editor.addListener(main.playerMarkupPlacedCheckListener);
	board.editor.addListener(main.treeJumpedCheckListener);
	board.nextButton.addEventListener("click", main.nextButtonClickListener);
	
	// console.log(besogo);
	// console.log(board.editor);
	// console.log(board.editor.getCurrent());
};


board.placeHandicap = async function() {
	if (settings.handicap) {
		let coords = board.HANDICAP_COORDS[settings.boardsize][settings.handicap];
		for (let i=0; i<coords.length; i++) {
			let coord = coords[i];
			if (i < coords.length - 1) {
				await board.draw(coord, "playB", true, utils.MOVE_TYPE.HANDICAP);
			} else {
				await board.draw(coord, "playB", false, utils.MOVE_TYPE.HANDICAP);
				scoreChart.update(await server.analyzeMove(coord, -1));
				await server.play(coord, -1);
			}
		}
	}
};

board.play = async function(suggestion, moveType = utils.MOVE_TYPE.NONE, tool = "auto") {
	await board.draw(suggestion.coord, tool, true, moveType);
	scoreChart.update(suggestion);
};

board.draw = async function(coord, tool = "auto", sendToServer = true, moveType = utils.MOVE_TYPE.NONE) {
	board.editor.setTool(tool);
	board.editor.click(coord.x, coord.y, false, false);
	board.editor.setTool("navOnly");

	if (tool == "auto" || tool == "playB" || tool == "playW") {
		board.playPlaceStoneAudio();

		sgf.setComment(moveType);

		if (board.lastMove.navTreeY != board.editor.getCurrent().navTreeY) {
			scoreChart.clear();
		}

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

board.playPlaceStoneAudio = function() {
	let placeStoneAudioIndex;
	do {
		placeStoneAudioIndex = utils.randomInt(5);
	} while (placeStoneAudioIndex == board.lastPlaceStoneAudioIndex);
	board.lastPlaceStoneAudioIndex = placeStoneAudioIndex;

	// board.placeStoneAudios[placeStoneAudioIndex].play();
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

board.pass = function() {
	board.editor.click(0, 0, false);
};

board.removeMarkup = function(coord) {
	let markup = board.editor.getCurrent().markup;
	markup[(coord.x - 1) * settings.boardsize + (coord.y - 1)] = 0;
};

board.drawCoords = function(suggestions) {
	let markup = board.editor.getCurrent().markup;
	for (let i=0; i<markup.length; i++) {
		if (markup[i] && markup[i] != 4) {
			markup[i] = 0;
		}
	}

	board.editor.setTool("label");
	for (let i=0; i<suggestions.length(); i++) {
		let coord = suggestions.get(i).coord;
		
		board.editor.setLabel(suggestions.get(i).grade);
		board.editor.click(coord.x, coord.y, false, false);
	}

	board.editor.setTool("navOnly");
};

board.goToNode = function(nodeNumber) {
	let currentNodeNumber = board.getMoveNumber();
	let nodesToJump = nodeNumber - currentNodeNumber;
	if (nodesToJump > 0) {
		board.editor.nextNode(nodesToJump);
	} else if (nodesToJump < 0) {
		board.editor.prevNode(nodesToJump * -1);
	}
};

board.getMoveNumber = function() {
	return board.editor.getCurrent().moveNumber;
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

board.keydownAndMousedownListener = function(event) {
	if (event.code == "Space" || event.code == "Enter" || event.button == 1) {
		board.nextButton.click();
	}
};