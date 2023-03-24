var db = {};


db.OPENING_RATIO_MOVENUMBER = 40;
db.MIDGAME_RATIO_MOVENUMBER = 120;


db.init = function () {};

db.clear = function () {};


db.save = async function () {
    await db.saveTrainerSettingConfig();
    await db.saveGameStats();
    await db.saveGame();
    alert("Game saved successfully");
};

db.saveTrainerSettingConfig = async function () {
    if (G.LOG) console.log("db.saveTrainerSettingConfig");

    return G.trainerRef
        .invokeMethodAsync(
            "SaveTrainerSettingConfig",
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
            settings.forceOpponentCorners,
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
            settings.showOpponentOptions
        )
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};

db.saveGameStats = async function () {
    if (G.LOG) console.log("db.saveGameStats");

    let gameRatio = stats.getRatio(0);
    let openingRatio = stats.getRatio(0, db.OPENING_RATIO_MOVENUMBER);
    let midgameRatio = stats.getRatio(db.OPENING_RATIO_MOVENUMBER + 1, db.MIDGAME_RATIO_MOVENUMBER);
    let endgameRatio = stats.getRatio(db.MIDGAME_RATIO_MOVENUMBER + 1);

    return G.trainerRef
        .invokeMethodAsync("SaveGameStats", gameRatio, openingRatio, midgameRatio, endgameRatio)
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};

db.saveGame = async function () {
    if (G.LOG) console.log("db.saveGame");

    return G.trainerRef
        .invokeMethodAsync(
            "SaveGame",
            G.result ? G.result.scoreLead : null,
            board.getNodeX(),
            board.getNodeY(),
            board.boardsize,
            board.handicap,
            G.color,
            sgf.ruleset,
            sgf.komi,
            besogo.composeSgf(board.editor),
            new Uint8Array(stats.encodeRatioHistory()),
            new Uint8Array(G.suggestionsHistory.encode()),
            new Uint8Array(G.moveTypeHistory.encode()),
            new Uint8Array(gameplay.chosenNotPlayedCoordHistory.encode()),
            G.wasPassed,
            sgf.isThirdParty
        )
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};
