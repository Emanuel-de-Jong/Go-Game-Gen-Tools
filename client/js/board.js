var board = {};

board.placeStoneAudios = [
	new Audio("resources/placeStone0.mp3"),
	new Audio("resources/placeStone1.mp3"),
	new Audio("resources/placeStone2.mp3"),
	new Audio("resources/placeStone3.mp3"),
	new Audio("resources/placeStone4.mp3")
];
board.lastPlaceStoneAudioIndex = 0;

board.init = async function() {
	await board.clear();
};

board.clear = async function() {
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

	await board.placeHandicap();
	
	board.editor.addListener(main.boardEditorListener);
	board.nextButton.addEventListener("click", main.nextButtonClickListener);

	// console.log(besogo);
	// console.log(board.editor);
	// console.log(board.editor.getCurrent());
};

board.pass = function() {
	board.editor.click(0, 0, false);
};

board.playPlaceStoneAudio = function() {
	let placeStoneAudioIndex;
	do {
		placeStoneAudioIndex = utils.randomInt(5);
	} while (placeStoneAudioIndex == board.lastPlaceStoneAudioIndex);
	board.lastPlaceStoneAudioIndex = placeStoneAudioIndex;

	board.placeStoneAudios[placeStoneAudioIndex].play();
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

board.keydownAndMousedownListener = function(event) {
	if (event.code == "Space" || event.code == "Enter" || event.button == 1) {
		board.nextButton.click();
	}
};
utils.addEventsListener(document, ["keydown", "mousedown"], board.keydownAndMousedownListener);

board.fillCorners = function() {
	let cornerOptions = [
		{ c44: {x:4,y:4}, c34: {x:3,y:4}, c43: {x:4,y:3}, c33: {x:3,y:3}, c45: {x:4,y:5}, c54: {x:5,y:4}, c35: {x:3,y:5}, c53: {x:5,y:3} },
		{ c44: {x:16,y:4}, c34: {x:17,y:4}, c43: {x:16,y:3}, c33: {x:17,y:3}, c45: {x:16,y:5}, c54: {x:15,y:4}, c35: {x:17,y:5}, c53: {x:15,y:3} },
		{ c44: {x:4,y:16}, c34: {x:3,y:16}, c43: {x:4,y:17}, c33: {x:3,y:17}, c45: {x:4,y:15}, c54: {x:5,y:16}, c35: {x:3,y:15}, c53: {x:5,y:17} },
		{ c44: {x:16,y:16}, c34: {x:17,y:16}, c43: {x:16,y:17}, c33: {x:17,y:17}, c45: {x:16,y:15}, c54: {x:15,y:16}, c35: {x:17,y:15}, c53: {x:15,y:17} },
	];
	cornerOptions = utils.shuffleArray(cornerOptions);

	let coords = [];
	let totalCornerChance = (settings.cornerSwitch44 ? settings.cornerChance44 : 0) +
		(settings.cornerSwitch34 ? settings.cornerChance34 : 0) +
		(settings.cornerSwitch33 ? settings.cornerChance33 : 0) +
		(settings.cornerSwitch45 ? settings.cornerChance45 : 0) +
		(settings.cornerSwitch35 ? settings.cornerChance35 : 0);
	for (let i=0; i<4; i++) {
		let coord;
		let cornerTypeRange = 0;
		let rndCornerType = utils.randomInt(totalCornerChance);
		let rndCornerSide = utils.randomInt(2);
		if (settings.cornerSwitch44 &&
				rndCornerType < (cornerTypeRange = cornerTypeRange + settings.cornerChance44)) {
			coord = cornerOptions[i].c44;
		}
		else if (settings.cornerSwitch34 &&
				rndCornerType < (cornerTypeRange = cornerTypeRange + settings.cornerChance34)) {
			coord = rndCornerSide ? cornerOptions[i].c34 : cornerOptions[i].c43;
		}
		else if (settings.cornerSwitch33 &&
				rndCornerType < (cornerTypeRange = cornerTypeRange + settings.cornerChance33)) {
			coord = cornerOptions[i].c33;
		}
		else if (settings.cornerSwitch45 &&
				rndCornerType < (cornerTypeRange = cornerTypeRange + settings.cornerChance45)) {
			coord = rndCornerSide ? cornerOptions[i].c45 : cornerOptions[i].c54;
		}
		else {
			coord = rndCornerSide ? cornerOptions[i].c35 : cornerOptions[i].c53;
		}

		coords.push(coord);
	}

	return coords;
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

board.play = async function(suggestion, comment, tool = "auto") {
	await board.draw(suggestion.coord, tool, true, comment);
	scoreChart.update(suggestion);
};

board.draw = async function(coord, tool = "auto", sendToServer = true, comment) {
	board.editor.setTool(tool);
	board.editor.click(coord.x, coord.y, false, false);
	board.editor.setTool("navOnly");

	if (comment) {
		sgf.setComment(comment);
	}

	if (tool == "auto" || tool == "playB" || tool == "playW") {
		board.playPlaceStoneAudio();

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

board.drawCoords = function(suggestions) {
	let markup = board.editor.getCurrent().markup;
	for (let i=0; i<markup.length; i++) {
		if (markup[i] && markup[i] != 4) {
			markup[i] = 0;
		}
	}

	board.editor.setTool("label");
	for (let i=0; i<suggestions.length; i++) {
		let coord = suggestions[i].coord;
		
		board.editor.setLabel(suggestions[i].grade);
		board.editor.click(coord.x, coord.y, false, false);
	}

	board.editor.setTool("navOnly");
};

board.removeMarkup = function(coord) {
	let markup = board.editor.getCurrent().markup;
	markup[(coord.x - 1) * settings.boardsize + (coord.y - 1)] = 0;
};

board.placeHandicap = async function() {
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

	if (settings.handicap) {
		let loopCount = placement[settings.boardsize][settings.handicap].length;
		for (let i=0; i<loopCount; i++) {
			let coord = placement[settings.boardsize][settings.handicap][i];
			if (i < loopCount - 1) {
				await board.draw(coord, "playB", true, "Handicap");
			} else {
				await board.draw(coord, "playB", false, "Handicap");
				scoreChart.update(await server.analyzeMove(coord, -1));
				await server.play(coord, -1);
			}
		}
	}
};

board.enableNextButton = function() {
	board.nextButton.disabled = false;
};

board.disableNextButton = function() {
	board.nextButton.disabled = true;
};