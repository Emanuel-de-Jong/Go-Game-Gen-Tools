var preMovePlacer = {};


preMovePlacer.stopPreMovesButton = document.getElementById("stopPreMoves");


preMovePlacer.init = async function() {
    await preMovePlacer.clear();
};

preMovePlacer.clear = async function() {
	preMovePlacer.isPreMovesStopped = false;
};


preMovePlacer.createPreMoves = async function() {
	preMovePlacer.stopPreMovesButton.hidden = false;
	selfplay.selfplayButton.hidden = true;

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
					if (preMovePlacer.isPreMovesStopped) break;

					await board.play(suggestion, "Corner pre move");
					preMovesLeft--;
				}
			}
		}
	
		for (let i=0; i<preMovesLeft; i++) {
			if (preMovePlacer.isPreMovesStopped) break;
			await preMovePlacer.playPreMove();
		}
	}

	if (settings.color == board.getColor()) {
		await preMovePlacer.playPreMove();
	}

	preMovePlacer.stopPreMovesButton.hidden = true;
	selfplay.selfplayButton.hidden = false;

	if (!main.isPassed) {
	    main.givePlayerControl();
	}
};

preMovePlacer.stopPreMovesButtonClickListener = function() {
	preMovePlacer.isPreMovesStopped = true;
};
preMovePlacer.stopPreMovesButton.addEventListener("click", preMovePlacer.stopPreMovesButtonClickListener);

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

preMovePlacer.playPreMove = async function() {
	let preOptions = 1;
	if ((utils.randomInt(100) + 1) <= settings.preOptionPerc) {
		preOptions = settings.preOptions;
	}

	await main.analyze(settings.preVisits, preOptions, 10, 50);
	if (main.isPassed) preMovePlacer.isPreMovesStopped = true;
	if (preMovePlacer.isPreMovesStopped) return;

	await board.play(main.suggestions.get(utils.randomInt(main.suggestions.length())), preMovePlacer.createPreComment());
};

preMovePlacer.createPreComment = function() {
	return "Pre move" +
	"\nStrength: " + settings.preVisits +
	"\nOptions: " + settings.preOptions +
	"\nOption chance: " + settings.preOptionPerc +
	main.createCommentGrades();
};