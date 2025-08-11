var G = {}


G.VERSION = "0.2.1";
G.LOG = false;

G.COLOR_TYPE = {
    B: -1,
    RANDOM: 0,
    W: 1,
};

G.COLOR_NAME_TYPE = {
	B: "B",
	RANDOM: "R",
	W: "W",
};

G.COLOR_FULL_NAME_TYPE = {
	B: "Black",
	RANDOM: "Random",
	W: "White",
};

G.MOVE_TYPE = {
    NONE: 0,
    INIT: 1,
    FORCED_CORNER: 2,
    PRE: 3,
    SELFPLAY: 4,
    PLAYER: 5,
    OPPONENT: 6,
};

G.PHASE_TYPE = {
    NONE: 0,
    INIT: 1,
	CORNERS: 2,
    PREMOVES: 3,
    GAMEPLAY: 4,
    SELFPLAY: 5,
    FINISHED: 6,
};


G.isLoadingServerData = false;


G.init = function (dotNetRef, kataGoVersion, serverSuggestions, serverMoveTypes) {
	G.dotNetRef = dotNetRef;
	G.kataGoVersion = kataGoVersion;

	G.phaseChangedEvent = new CEvent();

	G.clear(serverSuggestions, serverMoveTypes);
};

G.clear = function(serverSuggestions, serverMoveTypes) {
	G.setPhase(G.PHASE_TYPE.NONE);
	G.suggestions = null;
	G.suggestionsHistory = serverSuggestions ? History.fromServer(serverSuggestions, MoveSuggestionList) : new History();
	G.moveTypeHistory = serverMoveTypes ? History.fromServer(serverMoveTypes) : new History();
	G.result = null;
	G.isPassed = false;
	G.wasPassed = false;

	if (debug.testData == 1) {
		G.suggestionsHistory.add(new MoveSuggestionList([
				new MoveSuggestion(new Coord(16, 4), 700, 50_000_000, 800_000),
				new MoveSuggestion(new Coord(17, 4), 500, 49_000_000, -200_000),
			],
			new MoveSuggestion(new Coord(12, 12), 250, 20_000_000, -6_000_000)
		).addGrades(), 1, 0);
		G.suggestionsHistory.add(new MoveSuggestionList([
			new MoveSuggestion(new Coord(16, 3), 600, 51_000_000, 1_200_000),
			new MoveSuggestion(new Coord(17, 4), 600, 51_000_000, 1_200_000),
		]).addGrades(), 3, 0);
	}

	if (debug.testData == 1) {
        G.moveTypeHistory.add(G.MOVE_TYPE.PLAYER, 1, 0);
        G.moveTypeHistory.add(G.MOVE_TYPE.OPPONENT, 2, 0);
        G.moveTypeHistory.add(G.MOVE_TYPE.PLAYER, 3, 0);
        G.moveTypeHistory.add(G.MOVE_TYPE.OPPONENT, 4, 0);
        G.moveTypeHistory.add(G.MOVE_TYPE.PLAYER, 5, 0);
    
        G.moveTypeHistory.add(G.MOVE_TYPE.PLAYER, 1, 1);
        G.moveTypeHistory.add(G.MOVE_TYPE.PLAYER, 3, 1);
        G.moveTypeHistory.add(G.MOVE_TYPE.OPPONENT, 4, 1);
        G.moveTypeHistory.add(G.MOVE_TYPE.PLAYER, 5, 1);
    
        G.moveTypeHistory.add(G.MOVE_TYPE.PLAYER, 5, 2);
        G.moveTypeHistory.add(G.MOVE_TYPE.OPPONENT, 6, 2);
	}
};


G.setPhase = function(phase) {
	G.phase = phase;
	G.phaseChangedEvent.dispatch({ phase: phase });
}

G.setColor = function(color = board.getNextColor()) {
	if (color == G.COLOR_TYPE.RANDOM) {
		if (G.color != null) {
			color = G.color * -1;
		} else {
			color = utils.randomInt(2) == 0 ? G.COLOR_TYPE.B : G.COLOR_TYPE.W;
		}
	}

	G.color = color;
	if (G.phase != G.PHASE_TYPE.NONE && G.phase != G.PHASE_TYPE.INIT) {
		sgf.setPlayersMeta();
		sgf.setRankPlayerMeta();
		sgf.setRankAIMeta();
	}
}

G.colorNumToName = function(num) {
    return num == G.COLOR_TYPE.W ? G.COLOR_NAME_TYPE.W : G.COLOR_NAME_TYPE.B;
};

G.colorNumToFullName = function(num) {
    return num == G.COLOR_TYPE.W ? G.COLOR_FULL_NAME_TYPE.W : G.COLOR_FULL_NAME_TYPE.B;
};

G.colorNameToNum = function(name) {
    return name == G.COLOR_NAME_TYPE.W ? G.COLOR_TYPE.W : G.COLOR_TYPE.B;
};

G.colorFullNameToNum = function(name) {
    return name == G.COLOR_FULL_NAME_TYPE.W ? G.COLOR_TYPE.W : G.COLOR_TYPE.B;
};

G.analyze = async function(maxVisits, moveOptions, minVisitsPerc, maxVisitDiffPerc, color) {
	G.suggestions = await katago.analyze(maxVisits, moveOptions, minVisitsPerc, maxVisitDiffPerc, color);
	await G.pass(G.suggestions.passSuggestion);
};

G.analyzeMove = async function(coord) {
	let suggestion = new MoveSuggestion(coord, 0, 0, 0);

	if (!G.suggestions) {
		G.suggestions = new MoveSuggestionList();
	}
	G.suggestions.analyzeMoveSuggestion = suggestion;
	
	return suggestion;
};

G.pass = async function(suggestion) {
	if (!suggestion) return;

	G.isPassed = true;
	G.wasPassed = true;
	gameplay.takePlayerControl();
	board.nextButton.disabled = true;

	G.result = suggestion.score.copy();

	let resultStr = G.getResultStr();
	stats.setResult(resultStr);
	sgf.setResultMeta(resultStr);

	board.pass();

	// alert("Game finished!");
	// await db.save();
};

G.getResultStr = function() {
    if (G.result.scoreLead >= 0) {
        return G.COLOR_NAME_TYPE.B + "+" + G.result.formatScoreLead();
    }
    return G.COLOR_NAME_TYPE.W + "+" + G.result.formatScoreLead(true);
};