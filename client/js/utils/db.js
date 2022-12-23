var db = {}


db.init = async function () {
};

db.clear = async function() {
};


db.save = async function () {
    if (G.LOG) console.log("db.save " + G.colorNumToName(settings.color) + " " + board.getNodeX() + " " + board.getNodeY());

        return G.dotNetRef.invokeMethodAsync('Save', G.colorNumToName(settings.color),
            board.getNodeX(),
            board.getNodeY(),

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