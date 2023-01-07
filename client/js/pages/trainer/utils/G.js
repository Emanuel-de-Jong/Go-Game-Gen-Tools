var G = {}


G.VERSION = "0.9.1";
G.LOG = true;

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


G.init = function (dotNetRef) {
	G.dotNetRef = dotNetRef;

	G.phaseChangedEvent = new CEvent();

	G.clear();
};

G.clear = function() {
	G.setPhase(G.PHASE_TYPE.NONE);
	G.setColor(null);
	G.suggestions = null;
	G.suggestionsHistory = new History();
	G.moveTypeHistory = new History();
	G.result = null;
	G.isPassed = false;
	G.wasPassed = false;

	if (debug.TEST_DATA == 1) {
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
		color = utils.randomInt(2) == 0 ? G.COLOR_TYPE.B : G.COLOR_TYPE.W;
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

	G.updateSuggestionsHistory();
};

G.pass = async function(suggestion) {
	if (!suggestion) return;

	G.isPassed = true;
	G.wasPassed = true;
	gameplay.takePlayerControl();
	board.nextButton.disabled = true;

	G.result = suggestion.score.copy();
	if (suggestion.color != G.COLOR_TYPE.B) G.result.reverse();

	let resultStr = G.getResultStr();
	stats.setResult(resultStr);
	sgf.setResultMeta(resultStr);

	board.pass();

	// await db.save();
};

G.getResultStr = function() {
    if (G.result.scoreLead >= 0) {
        return G.COLOR_NAME_TYPE.B + "+" + G.result.formatScoreLead();
    }
    return G.COLOR_NAME_TYPE.W + "+" + G.result.formatScoreLead(true);
}

G.updateSuggestionsHistory = function() {
	G.suggestionsHistory.add(G.suggestions, board.getNodeX() + 1);
};