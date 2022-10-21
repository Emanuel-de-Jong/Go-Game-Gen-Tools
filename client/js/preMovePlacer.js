var preMovePlacer = {};


preMovePlacer.stopButton = document.getElementById("stopPreMoves");


preMovePlacer.init = function() {
    preMovePlacer.clear();
};

preMovePlacer.clear = function() {
	preMovePlacer.isStopped = false;
};


preMovePlacer.start = async function() {
	await board.placeHandicap();
	
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
					let suggestion = await server.analyzeMove(cornerCoords[i]);
					if (preMovePlacer.isStopped) break;

					await board.play(suggestion, utils.MOVE_TYPE.PRE_CORNER);
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

	if (!main.isPassed) {
	    main.givePlayerControl();
	}
};

preMovePlacer.stopButtonClickListener = function() {
	preMovePlacer.isStopped = true;
};
preMovePlacer.stopButton.addEventListener("click", preMovePlacer.stopButtonClickListener);

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

	await main.analyze(settings.preVisits, preOptions, main.BASE_MIN_VISITS_PERC, main.BASE_MAX_VISIT_DIFF_PERC);
	if (main.isPassed) preMovePlacer.isStopped = true;
	if (preMovePlacer.isStopped) return;

	await board.play(main.suggestions.get(utils.randomInt(main.suggestions.length())), utils.MOVE_TYPE.PRE);
};