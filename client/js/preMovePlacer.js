var preMovePlacer = {};


preMovePlacer.MIN_VISITS_PERC = 10;
preMovePlacer.MAX_VISIT_DIFF_PERC = 50;


preMovePlacer.init = function() {
	preMovePlacer.stopButton = document.getElementById("stopPreMoves");

	preMovePlacer.stopButton.addEventListener("click", preMovePlacer.stopButtonClickListener);
	
    preMovePlacer.clear();
};

preMovePlacer.clear = function() {
	preMovePlacer.isStopped = false;
};


preMovePlacer.start = async function () {
	G.setPhase(G.PHASE_TYPE.PREMOVES);
	
	preMovePlacer.stopButton.hidden = false;
	selfplay.button.hidden = true;

	if (settings.preMovesSwitch) {
		let preMovesLeft = settings.preMoves;

		if (settings.handicap == 0 && settings.boardsize == 19) {
			if (settings.cornerSwitch44 ||
					settings.cornerSwitch34 ||
					settings.cornerSwitch33 ||
					settings.cornerSwitch45 ||
					settings.cornerSwitch35) {
				let cornerCount = preMovesLeft < 4 ? preMovesLeft : 4;
				let cornerCoords = preMovePlacer.fillCorners(cornerCount);
				for (let i=0; i<cornerCount; i++) {
					let suggestion = await katago.analyzeMove(cornerCoords[i]);
					if (preMovePlacer.isStopped) break;

					await board.play(suggestion, G.MOVE_TYPE.PRE_CORNER);
					preMovesLeft--;
				}
			}
		}
	
		for (let i=0; i<preMovesLeft; i++) {
			if (preMovePlacer.isStopped) break;
			await preMovePlacer.play();
		}
	}

	if (settings.color == board.getColor()) {
		await preMovePlacer.play();
	}

	preMovePlacer.stopButton.hidden = true;
	selfplay.button.hidden = false;

	if (!G.isPassed) {
	    gameplay.givePlayerControl();
	}
};

preMovePlacer.stopButtonClickListener = function() {
	preMovePlacer.isStopped = true;
};

preMovePlacer.fillCorners = function(cornerCount) {
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
	
	for (let i=0; i<cornerCount; i++) {
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

preMovePlacer.play = async function() {
	let preOptions = 1;
	if ((utils.randomInt(100) + 1) <= settings.preOptionPerc) {
		preOptions = settings.preOptions;
	}

	await G.analyze(settings.preVisits, preOptions, preMovePlacer.MIN_VISITS_PERC, preMovePlacer.MAX_VISIT_DIFF_PERC);
	if (G.isPassed) preMovePlacer.isStopped = true;
	if (preMovePlacer.isStopped) return;

	await board.play(G.suggestions.get(utils.randomInt(1, G.suggestions.length())), G.MOVE_TYPE.PRE);
};