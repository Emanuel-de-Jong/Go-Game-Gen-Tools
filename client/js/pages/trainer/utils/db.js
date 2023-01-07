var db = {}


db.OPENING_RATIO_MOVENUMBER = 40;
db.MIDGAME_RATIO_MOVENUMBER = 120;


db.init = function () {
};

db.clear = function() {
};


db.save = async function () {
    await db.saveTrainerSettingConfig();
    await db.saveGameStats();
    await db.saveGame();
};

db.saveTrainerSettingConfig = async function() {
    if (G.LOG) console.log("db.saveTrainerSettingConfig");

    return G.dotNetRef.invokeMethodAsync('SaveTrainerSettingConfig',
        settings.boardsize,
        settings.handicap,
        settings.colorType,
        settings.preMovesSwitch,
        settings.preMoves,
        settings.preVisits,
        settings.selfplayVisits,
        settings.suggestionVisits,
        settings.opponentVisits,
        settings.disableAICorrection,

        settings.ruleset,
        settings.komiChangeStyle,
        settings.komi,

        settings.preOptions,
        settings.preOptionPerc,
        settings.cornerSwitch44,
        settings.cornerSwitch34,
        settings.cornerSwitch33,
        settings.cornerSwitch45,
        settings.cornerSwitch35,
        settings.cornerChance44,
        settings.cornerChance34,
        settings.cornerChance33,
        settings.cornerChance45,
        settings.cornerChance35,

        settings.suggestionOptions,
        settings.showOptions,
        settings.showWeakerOptions,
        settings.minVisitsPercSwitch,
        settings.minVisitsPerc,
        settings.maxVisitDiffPercSwitch,
        settings.maxVisitDiffPerc,

        settings.opponentOptionsSwitch,
        settings.opponentOptions,
        settings.opponentOptionPerc,
        settings.showOpponentOptions)
    .then(response => {
        return response;
    })
    .catch(error => {
        return error;
    });
};

db.saveGameStats = async function () {
    if (G.LOG) console.log("db.saveGameStats");

    let openingRatio = stats.getRatio(0, db.OPENING_RATIO_MOVENUMBER);
    let midgameRatio = stats.getRatio(db.OPENING_RATIO_MOVENUMBER+1, db.MIDGAME_RATIO_MOVENUMBER);
    let endgameRatio = stats.getRatio(db.MIDGAME_RATIO_MOVENUMBER+1);

    return G.dotNetRef.invokeMethodAsync('SaveGameStats',
        openingRatio.moveNumber,
        openingRatio.total,
        openingRatio.right,
        openingRatio.rightStreak,
        openingRatio.rightTopStreak,
        openingRatio.perfect,
        openingRatio.perfectStreak,
        openingRatio.perfectTopStreak,

        midgameRatio.moveNumber,
        midgameRatio.total,
        midgameRatio.right,
        midgameRatio.rightStreak,
        midgameRatio.rightTopStreak,
        midgameRatio.perfect,
        midgameRatio.perfectStreak,
        midgameRatio.perfectTopStreak,

        endgameRatio.moveNumber,
        endgameRatio.total,
        endgameRatio.right,
        endgameRatio.rightStreak,
        endgameRatio.rightTopStreak,
        endgameRatio.perfect,
        endgameRatio.perfectStreak,
        endgameRatio.perfectTopStreak)
    .then(response => {
        return response;
    })
    .catch(error => {
        return error;
    });
};

db.saveGame = async function () {
    if (G.LOG) console.log("db.saveGame");

    return G.dotNetRef.invokeMethodAsync('SaveGame',
        G.color,
        G.result ? G.result.scoreLead : null,
        board.getNodeX(),
        board.getNodeY(),
        besogo.composeSgf(board.editor),
        new Uint8Array(stats.encodeRatioHistory()),
        new Uint8Array(G.suggestionsHistory.encode()),
        new Uint8Array(scoreChart.history.encode()),
        new Uint8Array(G.moveTypeHistory.encode()),
        new Uint8Array(gameplay.chosenNotPlayedCoordHistory.encode()),
        G.wasPassed,
        sgf.isThirdParty)
    .then(response => {
        return response;
    })
    .catch(error => {
        return error;
    });
};