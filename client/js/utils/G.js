var G = {}


G.VERSION = "0.9.1";
G.LOG = true;

G.COLOR_TYPE = {
    B: -1,
    RANDOM: 0,
    W: 1,
}

G.MOVE_TYPE = {
    NONE: 0,
    INIT: 1,
    HANDICAP: 2,
    PRE_CORNER: 3,
    PRE: 4,
    SELFPLAY: 5,
    PLAYER: 6,
    OPPONENT: 7,
};

G.PHASE_TYPE = {
    NONE: 0,
    INIT: 1,
    PREMOVES: 2,
    GAMEPLAY: 3,
    SELFPLAY: 4,
    FINISHED: 5,
};


G.init = function (dotNetRef) {
	G.dotNetRef = dotNetRef;

	G.phaseChangedEvent = new CEvent();

	G.clear();
};

G.clear = function() {
	G.phase = G.PHASE_TYPE.NONE;
	G.suggestions = null;
	G.suggestionsHistory = [];
	G.moveTypeHistory = [];
	G.isPassed = false;
};


G.setPhase = function(phase) {
	G.phase = phase;
	G.phaseChangedEvent.dispatch({ phase: phase });
}

G.colorNumToName = function(num) {
    return num == G.COLOR_TYPE.W ? "W" : "B";
};

G.colorNameToNum = function(name) {
    return name == "W" ? G.COLOR_TYPE.W : G.COLOR_TYPE.B;
};

G.analyze = async function(maxVisits, moveOptions, minVisitsPerc, maxVisitDiffPerc, color) {
	G.suggestions = await katago.analyze(maxVisits, moveOptions, minVisitsPerc, maxVisitDiffPerc, color);

	G.pass(G.suggestions.passSuggestion);

	G.updateSuggestionsHistory();
};

G.pass = function(suggestion) {
	if (!suggestion) return;

	G.isPassed = true;
	gameplay.takePlayerControl();
	board.nextButton.disabled = true;

	let result;
    if (suggestion.scoreLead >= 0) {
        result = G.colorNumToName(suggestion.color) + "+" + suggestion.scoreLead;
    } else {
        result = G.colorNumToName(suggestion.color * -1) + "+" + (suggestion.scoreLead * -1);
    }
	stats.setResult(result);
	sgf.setResult(result);

	board.pass();

	// db.save();
};

G.updateSuggestionsHistory = function() {
	let nodeCoord = board.getNodeCoord();
	if (!G.suggestionsHistory[nodeCoord.y]) {
		G.suggestionsHistory[nodeCoord.y] = [];
	}
	G.suggestionsHistory[nodeCoord.y][nodeCoord.x+1] = G.suggestions;
};

G.updateMoveTypeHistory = function(type) {
	let nodeCoord = board.getNodeCoord();
	if (!G.moveTypeHistory[nodeCoord.y]) {
		G.moveTypeHistory[nodeCoord.y] = [];
	}
	G.moveTypeHistory[nodeCoord.y][nodeCoord.x] = type;
};

G.setSuggestions = function(coord = board.getNodeCoord()) {
	G.suggestions = null;
	if (G.suggestionsHistory[coord.y]) {
		G.suggestions = G.suggestionsHistory[coord.y][coord.x];
	}
};