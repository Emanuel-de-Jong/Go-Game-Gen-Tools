var preMovePlacer = {};


preMovePlacer.PRE_OPTIONS = 3;
preMovePlacer.BASE_MIN_VISITS_PERC = 5;
preMovePlacer.BASE_MAX_VISIT_DIFF_PERC = 100;

preMovePlacer.init = function() {
    preMovePlacer.clear();
};

preMovePlacer.clear = function() {
	preMovePlacer.suggestions = null;
};


preMovePlacer.start = async function() {
	if (settings.state == utils.STATE.B) {
		let rndMove = [
			{x:7,y:5}, {x:7,y:4}, {x:7,y:3},
			{x:6,y:5}, {x:6,y:4},
		];

		await board.draw(new Coord(5, 5));
		await board.draw(rndMove[utils.randomInt(rndMove.length)]);
		await preMovePlacer.play();
		await preMovePlacer.play(2);
		for (let i=0; i<2; i++) {
			await preMovePlacer.play();
		}
	}
	else if (settings.state == utils.STATE.W) {
		let rndMove = [
			{x:7,y:5}, {x:7,y:4}, {x:7,y:3},
			{x:6,y:5}, {x:6,y:4},
			{x:5,y:5},
		];

		await board.draw(rndMove[utils.randomInt(rndMove.length)]);
		await preMovePlacer.play();
		await preMovePlacer.play(2);
		for (let i=0; i<3; i++) {
			await preMovePlacer.play();
		}
	}
	else if (settings.state == utils.STATE.BH) {
		let rndMove = {
			2: [
				{x:7,y:4}, {x:7,y:5}, {x:7,y:6}, {x:7,y:7},
				{x:6,y:4}, {x:6,y:5}, {x:6,y:6},
				{x:5,y:5},
			],
			3: [
				{x:7,y:4}, {x:7,y:5}, {x:7,y:6}, {x:7,y:7},
				{x:6,y:4}, {x:6,y:5}, {x:6,y:6},
				{x:5,y:5},
			],
			4: [
				{x:7,y:4}, {x:7,y:5},
				{x:6,y:4}, {x:6,y:5},
				{x:5,y:5},
			],
		}

		await board.placeHandicap();
		await board.draw(rndMove[settings.handicap][utils.randomInt(rndMove[settings.handicap].length)]);
		await preMovePlacer.play();
		await preMovePlacer.play(2);
		for (let i=0; i<3; i++) {
			await preMovePlacer.play();
		}
	}
	else if (settings.state == utils.STATE.WH) {
		await board.placeHandicap();
		await preMovePlacer.play();
		await preMovePlacer.play(6);
		await preMovePlacer.play();
		await preMovePlacer.play(2);
		for (let i=0; i<2; i++) {
			await preMovePlacer.play();
		}
	}

	await server.sgf();
	init.clear();
};

preMovePlacer.play = async function(moveOptions = 1) {
	let suggestions = await server.analyze(moveOptions);

	let suggestionsByGrade = [[]];
	let index = 0;
	let grade = "A";
	for (let i=0; i<suggestions.length(); i++) {
		let suggestion = suggestions.get(i);

		if (grade != suggestion.grade) {
			grade = suggestion.grade;
			index++;
			suggestionsByGrade[index] = [];
		}

		suggestionsByGrade[index].push(suggestion);
	}

	let filteredSuggestions = suggestionsByGrade[utils.randomInt(suggestionsByGrade.length)];

	await board.play(filteredSuggestions[utils.randomInt(filteredSuggestions.length)]);
};