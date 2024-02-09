var preMovePlacer = {};


preMovePlacer.PRE_OPTIONS = 1;
preMovePlacer.BASE_MIN_VISITS_PERC = 5;
preMovePlacer.BASE_MAX_VISIT_DIFF_PERC = 100;

preMovePlacer.init = function() {
    preMovePlacer.clear();
};

preMovePlacer.clear = function() {
	preMovePlacer.suggestions = null;
};


preMovePlacer.start = async function() {
	let preMovesLeft = settings.preMoves;

	let cornerCount = preMovesLeft < 4 ? preMovesLeft : 4;
	let cornerCoords = preMovePlacer.fillCorners(cornerCount);
	for (let i=0; i<cornerCount; i++) {
		if (preMovePlacer.isStopped) break;

		await board.draw(cornerCoords[i]);
		preMovesLeft--;
	}

	for (let i=0; i<preMovesLeft; i++) {
		if (preMovePlacer.isStopped) break;
		await preMovePlacer.play(i == 0);
	}

	await server.sgf();
	init.clear();
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
	let totalCornerChance = settings.cornerChance44 +
		settings.cornerChance34 +
		(settings.onlyCommonCorners ? 0 : settings.cornerChance33) +
		(settings.onlyCommonCorners ? 0 : settings.cornerChance45) +
		(settings.onlyCommonCorners ? 0 : settings.cornerChance35);
	
	for (let i=0; i<cornerCount; i++) {
		let coord;
		let cornerTypeRange = 0;
		let rndCornerType = utils.randomInt(totalCornerChance);
		let rndCornerSide = utils.randomInt(2);
		if (rndCornerType < (cornerTypeRange = cornerTypeRange + settings.cornerChance44)) {
			coord = cornerOptions[i].c44;
		}
		else if (rndCornerType < (cornerTypeRange = cornerTypeRange + settings.cornerChance34)) {
			coord = rndCornerSide ? cornerOptions[i].c34 : cornerOptions[i].c43;
		}
		else if (!settings.onlyCommonCorners && rndCornerType < (cornerTypeRange = cornerTypeRange + settings.cornerChance33)) {
			coord = cornerOptions[i].c33;
		}
		else if (!settings.onlyCommonCorners && rndCornerType < (cornerTypeRange = cornerTypeRange + settings.cornerChance45)) {
			coord = rndCornerSide ? cornerOptions[i].c45 : cornerOptions[i].c54;
		}
		else if (!settings.onlyCommonCorners) {
			coord = rndCornerSide ? cornerOptions[i].c35 : cornerOptions[i].c53;
		}

		console.log(coord);

		coords.push(coord);
	}

	return coords;
};

preMovePlacer.play = async function(isFirstMove = false) {
	let preOptions = settings.preOptions;
	if (isFirstMove) preOptions = preMovePlacer.PRE_OPTIONS;

	preMovePlacer.suggestions = await server.analyze(settings.preVisits, preOptions, preMovePlacer.BASE_MIN_VISITS_PERC, preMovePlacer.BASE_MAX_VISIT_DIFF_PERC);
	if (preMovePlacer.isStopped) return;

	let suggestionsByGrade = [[]];
	let index = 0;
	let grade = "A";
	for (let i=0; i<preMovePlacer.suggestions.length(); i++) {
		let suggestion = preMovePlacer.suggestions.get(i);

		if (grade != suggestion.grade) {
			grade = suggestion.grade;
			index++;
			suggestionsByGrade[index] = [];
		}

		suggestionsByGrade[index].push(suggestion);
	}

	let suggestions = suggestionsByGrade[suggestionsByGrade.length-1];

	if (suggestions[0].color != settings.color) {
		for (let i=0; i<suggestionsByGrade.length-1; i++) {
			if (utils.randomInt(3) < 2) {
				suggestions = suggestionsByGrade[i];
				break;
			}
		}
	}

	await board.play(suggestions[utils.randomInt(suggestions.length)]);
};