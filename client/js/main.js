var main = {};

main.restartButton = document.getElementById("restart");
main.stopPreMovesButton = document.getElementById("stopPreMoves");
main.selfplayButton = document.getElementById("selfplay");

main.init = async function() {
	await main.clear(utils.SOURCE.MAIN);
};

main.clear = async function(source) {
	main.suggestionsPromise;
	main.suggestions;
	main.suggestionsHistory = [];
	main.selfplayPromise;
	main.isPlayerControlling = false;
	main.isJumped = false;
	main.isPassed = false;
	main.isSelfplay = false;
	main.isPreMovesStopped = false;
	main.playerTurnId = 0;
	main.opponentTurnId = 0;

	if (source !== utils.SOURCE.SERVER) await server.init();

	if (source !== utils.SOURCE.STATS) stats.init();

	if (source !== utils.SOURCE.BOARD) {
		await board.init();
		board.editor.addListener(main.boardEditorListener);
		board.nextButton.addEventListener("click", main.nextButtonClickListener);

		main.stopPreMovesButton.hidden = false;
		main.selfplayButton.hidden = true;
		await main.createPreMoves();
	}
};

main.stopPreMovesButtonClickListener = function() {
	main.isPreMovesStopped = true;
};
main.stopPreMovesButton.addEventListener("click", main.stopPreMovesButtonClickListener);

main.pass = function(suggestion) {
	main.isPassed = true;
	main.takePlayerControl();
	board.disableNextButton();

	let result;
    if (suggestion.scoreLead >= 0) {
        result = utils.colorNumToName(suggestion.color) + "+" + suggestion.scoreLead;
    } else {
        result = utils.colorNumToName(suggestion.color * -1) + "+" + (suggestion.scoreLead * -1);
    }
	stats.setResult(result);
	board.sgf.setResult(result);

	board.pass();
};

main.analyze = async function({
		maxVisits = settings.suggestionVisits,
		moveOptions = settings.suggestionOptions,
		minVisitsPerc = settings.minVisitsPerc,
		maxVisitDiffPerc = settings.maxVisitDiffPerc,
		color = board.getNextColor() } = {}) {
	let suggestionsWithPass = await server.analyze(maxVisits, color, moveOptions, minVisitsPerc, maxVisitDiffPerc);
	
	main.suggestions = [];
	for (let i=0; i<suggestionsWithPass.length; i++) {
		if (!suggestionsWithPass[i].isPass()) {
			main.suggestions.push(suggestionsWithPass[i]);
		}
	}

	if (suggestionsWithPass[0].isPass()) {
		main.pass(suggestionsWithPass[0]);
	}

	let gradeIndex = 0;
	for (let i=0; i<main.suggestions.length; i++) {
		let suggestion = main.suggestions[i];
		if (i != 0 && suggestion.visits != main.suggestions[i - 1].visits) {
			gradeIndex++;
		}
		suggestion.grade = String.fromCharCode(gradeIndex + 65);
	}

	main.updateSuggestionsHistory();
};

main.updateSuggestionsHistory = function() {
	let currentMove = board.editor.getCurrent();
	let y = currentMove.navTreeY;
	let x = currentMove.moveNumber + 1;

	if (!main.suggestionsHistory[y]) {
		main.suggestionsHistory[y] = [];
	}
	main.suggestionsHistory[y][x] = main.suggestions;
};

main.playPreMove = async function() {
	let preOptions = 1;
	if ((utils.randomInt(100) + 1) <= settings.preOptionPerc) {
		preOptions = settings.preOptions;
	}

	await main.analyze({
		maxVisits: settings.preVisits,
		moveOptions: preOptions,
		minVisitsPerc: 10,
		maxVisitDiffPerc: 50 });
	if (main.isPassed) main.isPreMovesStopped = true;
	if (main.isPreMovesStopped) return;

	await board.play(main.suggestions[utils.randomInt(main.suggestions.length)], main.createPreComment());
};

main.createPreMoves = async function() {
	if (settings.preMovesSwitch) {
		let preMovesLeft = settings.preMoves;

		if (settings.handicap == 0 && settings.boardsize == 19) {
			if (settings.cornerSwitch44 ||
					settings.cornerSwitch34 ||
					settings.cornerSwitch33 ||
					settings.cornerSwitch45 ||
					settings.cornerSwitch35) {
				let cornerCount = preMovesLeft < 4 ? preMovesLeft : 4;
				let cornerCoords = board.fillCorners();
				for (let i=0; i<cornerCount; i++) {
					let suggestion = await server.analyzeMove(cornerCoords[i]);
					if (main.isPreMovesStopped) break;

					await board.play(suggestion, "Corner pre move");
					preMovesLeft--;
				}
			}
		}
	
		for (let i=0; i<preMovesLeft; i++) {
			if (main.isPreMovesStopped) break;
			await main.playPreMove();
		}
	}

	if (settings.color == board.getColor()) {
		await main.playPreMove();
	}

	main.stopPreMovesButton.hidden = true;
	main.selfplayButton.hidden = false;

	if (!main.isPassed) {
	main.givePlayerControl();
	}
};

main.boardEditorListener = async function(event) {
	if (event.markupChange && event.mark == 4 && main.isPlayerControlling && !board.sgf.isSGFLoading) {
		main.takePlayerControl();

		let markupCoord = new Coord(event.x, event.y);
		board.removeMarkup(markupCoord);

        await main.playerTurn(markupCoord);
    } else if (event.navChange) {
		stats.clearVisits();

		let currentMove = board.editor.getCurrent();
		if ((board.lastMove.moveNumber+1 != currentMove.moveNumber ||
				board.lastMove.navTreeY != currentMove.navTreeY)) {
			
			main.suggestions = null;
			if (main.suggestionsHistory[currentMove.navTreeY]) {
				main.suggestions = main.suggestionsHistory[currentMove.navTreeY][currentMove.moveNumber];
			}

			if (main.suggestions) {
				stats.setVisits(main.suggestions);
				board.drawCoords(main.suggestions);
			}
	
			if (!event.treeChange && !main.isJumped) {
				main.isJumped = true;
				main.isPassed = false;
	
				board.disableNextButton();
				main.givePlayerControl(false);
			}
		}
	}
};

main.givePlayerControl = function(isSuggestionNeeded = true) {
	board.editor.setTool("cross");
	main.isPlayerControlling = true;
	if (isSuggestionNeeded) {
		main.suggestionsPromise = main.analyze();
	}
};

main.takePlayerControl = function() {
	board.editor.setTool("navOnly");
	main.isPlayerControlling = false;
};

main.nextButtonClickListener = async function() {
	board.disableNextButton();
	await main.opponentTurn();
};

main.playerTurn = async function(markupCoord) {
	let playerTurnId = ++main.playerTurnId;
	
	if (main.isJumped) {
		main.isJumped = false;
		await server.setBoard();
		if (playerTurnId != main.playerTurnId) return;
		main.suggestionsPromise = main.analyze();
	}

	await main.suggestionsPromise;
	if (main.isPassed) return;
	if (playerTurnId != main.playerTurnId) return;

	let suggestionToPlay = main.suggestions[0];
	let isRightChoice = false;
	let isPerfectChoice = false;
	for (let i=0; i<main.suggestions.length; i++) {
		if (markupCoord.compare(main.suggestions[i].coord)) {
			if (i == 0 || main.suggestions[i].visits == main.suggestions[0].visits) {
				isPerfectChoice = true;
			}

			isRightChoice = true;
			suggestionToPlay = main.suggestions[i];
			break;
		}
	}

	if (settings.hideWeakerOptions && suggestionToPlay) {
		let suggestions = main.suggestions;
		main.suggestions = [];
		for (let i=0; i<suggestions.length; i++) {
			main.suggestions.push(suggestions[i]);
			if (suggestions[i].coord.compare(markupCoord)) {
				break;
			}
		}

		main.updateSuggestionsHistory();
	}
	
	let opponentOptions = 1;
	if (settings.opponentOptionsSwitch) {
		if ((utils.randomInt(100) + 1) <= settings.opponentOptionPerc) {
			opponentOptions = settings.opponentOptions;
		}
	}

	if (!settings.disableAICorrection || isRightChoice) {
		await board.play(suggestionToPlay, main.createPlayerComment());

		if (!isRightChoice) await board.draw(markupCoord, "cross");

		main.suggestionsPromise = main.analyze({ maxVisits: settings.opponentVisits, moveOptions: opponentOptions });
	} else {
		await board.draw(markupCoord, "auto", false, main.createPlayerComment());
	}

	stats.setVisits(main.suggestions);
	stats.updateRatio(isRightChoice, isPerfectChoice);

	if (!settings.skipNextButton) {
		board.drawCoords(main.suggestions);
	}

	if (settings.disableAICorrection && !isRightChoice) {
		stats.scoreChart.update(await server.analyzeMove(markupCoord));
		await server.play(markupCoord);

		main.suggestionsPromise = main.analyze({ maxVisits: settings.opponentVisits, moveOptions: opponentOptions });
	}

	if (!settings.skipNextButton) {
		board.enableNextButton();
	} else {
		await main.nextButtonClickListener();
	}
};

main.opponentTurn = async function() {
	let opponentTurnId = ++main.opponentTurnId;

	await main.suggestionsPromise;
	if (main.isPassed) return;
	if (opponentTurnId != main.opponentTurnId) return;

	if (settings.skipNextButton) {
		board.drawCoords(main.suggestions);
	}

	await board.play(main.suggestions[utils.randomInt(main.suggestions.length)], main.createOpponentComment());

	main.givePlayerControl();
};

main.restartButtonClickListener = async function() {
	await main.clear(utils.SOURCE.MAIN);
};
main.restartButton.addEventListener("click", main.restartButtonClickListener);

main.selfplayButtonClickListener = async function() {
	if (!main.isSelfplay) {
		main.isSelfplay = true;
		main.selfplayButton.innerHTML = "Stop selfplay";

		main.takePlayerControl();
		board.disableNextButton();

		main.selfplayPromise = main.selfplay();
	} else {
		main.isSelfplay = false;
		main.selfplayButton.innerHTML = "Start selfplay";

		await main.selfplayPromise;

		if (!main.isPassed) {
			main.givePlayerControl();
		}
	}
};
main.selfplayButton.addEventListener("click", main.selfplayButtonClickListener);

main.selfplay = async function() {
	while (main.isSelfplay || settings.color != board.getNextColor()) {
		await main.analyze({ maxVisits: settings.selfplayVisits, moveOptions: 1 });
		if (main.isPassed) {
			main.selfplayButton.click();
			return;
		}

		if (!main.isSelfplay && settings.color == board.getNextColor()) return;

		await board.play(main.suggestions[0], main.createSelfplayComment());
	}
};


(function () {

	main.init();

})();

main.createCommentGrades = function() {
	comment = "";
	for (let i=0; i<main.suggestions.length; i++) {
		let suggestion = main.suggestions[i];
        if (i != 0 && suggestion.visits == main.suggestions[i - 1].visits) continue;

		comment += "\n" + suggestion.grade + ": " + suggestion.visits;
	}

	return comment;
};

main.createPreComment = function() {
	return "Pre move" +
	"\nStrength: " + settings.preVisits +
	"\nOptions: " + settings.preOptions +
	"\nOption chance: " + settings.preOptionPerc +
	main.createCommentGrades();
};

main.createSelfplayComment = function() {
	return "Selfplay move" +
	"\nStrength: " + settings.selfplayVisits +
	main.createCommentGrades();
};

main.createPlayerComment = function() {
	return "Player move" +
	"\nStrength: " + settings.suggestionVisits +
	"\nOptions: " + settings.suggestionOptions +
	"\nHide weaker options: " + settings.hideWeakerOptions +
	(settings.minVisitsPercSwitch ? "\nMin strength: " + settings.minVisitsPerc : "") +
	(settings.maxVisitDiffPercSwitch ? "\nMax strength difference" + settings.maxVisitDiffPerc : "") +
	main.createCommentGrades();
};

main.createOpponentComment = function() {
	return "Opponent move" +
	"\nStrength: " + settings.opponentVisits +
	(settings.opponentOptionsSwitch ? "\nOptions: " + settings.opponentOptions : "") +
	"\nOption chance: " + settings.opponentOptionPerc +
	main.createCommentGrades();
};