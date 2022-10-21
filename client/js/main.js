var main = {};


main.stopPreMovesButton = document.getElementById("stopPreMoves");
main.selfplayButton = document.getElementById("selfplay");


main.init = function() {
	main.clear();
};

main.clear = function() {
	main.suggestionsPromise = null;
	main.suggestions = null;
	main.suggestionsHistory = [];
	main.selfplayPromise = null;
	main.isPreMovesStopped = false;
	main.isPlayerControlling = false;
	main.isJumped = false;
	main.isSelfplay = false;
	main.isPassed = false;
	main.playerTurnId = 0;
	main.opponentTurnId = 0;
};


main.createPreMoves = async function() {
	main.stopPreMovesButton.hidden = false;
	main.selfplayButton.hidden = true;

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

main.stopPreMovesButtonClickListener = function() {
	main.isPreMovesStopped = true;
};
main.stopPreMovesButton.addEventListener("click", main.stopPreMovesButtonClickListener);

main.playPreMove = async function() {
	let preOptions = 1;
	if ((utils.randomInt(100) + 1) <= settings.preOptionPerc) {
		preOptions = settings.preOptions;
	}

	await main.analyze(settings.preVisits, preOptions, 10, 50);
	if (main.isPassed) main.isPreMovesStopped = true;
	if (main.isPreMovesStopped) return;

	await board.play(main.suggestions.get(utils.randomInt(main.suggestions.length())), main.createPreComment());
};

main.analyze = async function(
		maxVisits = settings.suggestionVisits,
		moveOptions = settings.suggestionOptions,
		minVisitsPerc = settings.minVisitsPerc,
		maxVisitDiffPerc = settings.maxVisitDiffPerc,
		color = board.getNextColor()) {
	main.suggestions = await server.analyze(maxVisits, color, moveOptions, minVisitsPerc, maxVisitDiffPerc);

	let firstSuggestion = main.suggestions.filterByPass();
	if (firstSuggestion.isPass()) {
		main.pass(firstSuggestion);
	}

	main.suggestions.addGrades();

	main.updateSuggestionsHistory();
};

main.pass = function(suggestion) {
	main.isPassed = true;
	main.takePlayerControl();
	board.nextButton.disabled = true;

	let result;
    if (suggestion.scoreLead >= 0) {
        result = utils.colorNumToName(suggestion.color) + "+" + suggestion.scoreLead;
    } else {
        result = utils.colorNumToName(suggestion.color * -1) + "+" + (suggestion.scoreLead * -1);
    }
	stats.setResult(result);
	sgf.setResult(result);

	board.pass();
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

main.updateSuggestionsHistory = function() {
	let currentMove = board.editor.getCurrent();
	let y = currentMove.navTreeY;
	let x = currentMove.moveNumber + 1;

	if (!main.suggestionsHistory[y]) {
		main.suggestionsHistory[y] = [];
	}
	main.suggestionsHistory[y][x] = main.suggestions;
};

main.createPreComment = function() {
	return "Pre move" +
	"\nStrength: " + settings.preVisits +
	"\nOptions: " + settings.preOptions +
	"\nOption chance: " + settings.preOptionPerc +
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

main.createSelfplayComment = function() {
	return "Selfplay move" +
	"\nStrength: " + settings.selfplayVisits +
	main.createCommentGrades();
};

main.createCommentGrades = function() {
	comment = "";
	for (let i=0; i<main.suggestions.length(); i++) {
		let suggestion = main.suggestions.get(i);
        if (i != 0 && suggestion.visits == main.suggestions.get(i - 1).visits) continue;

		comment += "\n" + suggestion.grade + ": " + suggestion.visits;
	}

	return comment;
};

main.playerMarkupPlacedCheckListener = async function(event) {
	if (event.markupChange && event.mark == 4 && main.isPlayerControlling && !sgf.isSGFLoading) {
		main.takePlayerControl();

		let markupCoord = new Coord(event.x, event.y);
		board.removeMarkup(markupCoord);

        await main.playerTurn(markupCoord);
    }
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

	let suggestionToPlay = main.suggestions.get(0);
	let isRightChoice = false;
	let isPerfectChoice = false;
	for (let i=0; i<main.suggestions.length(); i++) {
		if (markupCoord.compare(main.suggestions.get(i).coord)) {
			if (i == 0 || main.suggestions.get(i).visits == main.suggestions.get(0).visits) {
				isPerfectChoice = true;
			}

			isRightChoice = true;
			suggestionToPlay = main.suggestions.get(i);
			break;
		}
	}

	if (settings.hideWeakerOptions) {
		main.suggestions.filterWeakerThan(markupCoord);
		main.updateSuggestionsHistory();
	}
	
	await main.playerPlay(isRightChoice, isPerfectChoice, suggestionToPlay, markupCoord);

	if (!settings.skipNextButton) {
		board.nextButton.disabled = false;
	} else {
		await main.nextButtonClickListener();
	}
};

main.playerPlay = async function(isRightChoice, isPerfectChoice, suggestionToPlay, markupCoord) {
	let opponentOptions = main.getOpponentOptions();

	if (!settings.disableAICorrection || isRightChoice) {
		await board.play(suggestionToPlay, main.createPlayerComment());

		if (!isRightChoice) await board.draw(markupCoord, "cross");

		main.suggestionsPromise = main.analyze(settings.opponentVisits, opponentOptions);
	} else {
		await board.draw(markupCoord, "auto", false, main.createPlayerComment());
	}

	stats.updateRatio(isRightChoice, isPerfectChoice);
	stats.setVisits(main.suggestions);

	if (!settings.skipNextButton) {
		board.drawCoords(main.suggestions);
	}

	if (settings.disableAICorrection && !isRightChoice) {
		scoreChart.update(await server.analyzeMove(markupCoord));
		await server.play(markupCoord);

		main.suggestionsPromise = main.analyze(settings.opponentVisits, opponentOptions);
	}
};

main.getOpponentOptions = function() {
	let opponentOptions = 1;
	if (settings.opponentOptionsSwitch) {
		if ((utils.randomInt(100) + 1) <= settings.opponentOptionPerc) {
			opponentOptions = settings.opponentOptions;
		}
	}
	return opponentOptions;
};

main.nextButtonClickListener = async function() {
	board.nextButton.disabled = true;
	await main.opponentTurn();
};

main.opponentTurn = async function() {
	let opponentTurnId = ++main.opponentTurnId;

	await main.suggestionsPromise;
	if (main.isPassed) return;
	if (opponentTurnId != main.opponentTurnId) return;

	if (settings.skipNextButton) {
		board.drawCoords(main.suggestions);
	}

	await board.play(main.suggestions.get(utils.randomInt(main.suggestions.length())), main.createOpponentComment());

	main.givePlayerControl();
};

main.treeJumpedCheckListener = function(event) {
	if (event.navChange) {
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
	
				board.nextButton.disabled = true;
				main.givePlayerControl(false);
			}
		}
	}
};

main.selfplay = async function() {
	while (main.isSelfplay || settings.color != board.getNextColor()) {
		await main.analyze(settings.selfplayVisits, 1);
		if (main.isPassed) {
			main.selfplayButton.click();
			return;
		}

		if (!main.isSelfplay && settings.color == board.getNextColor()) return;

		await board.play(main.suggestions.get(0), main.createSelfplayComment());
	}
};

main.selfplayButtonClickListener = async function() {
	if (!main.isSelfplay) {
		main.isSelfplay = true;
		main.selfplayButton.innerHTML = "Stop selfplay";

		main.takePlayerControl();
		board.nextButton.disabled = true;

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