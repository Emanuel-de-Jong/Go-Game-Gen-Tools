var sgf = {};


sgf.init = async function (userName, serverKomi, serverRuleset) {
    sgf.rulesetElement = document.getElementById("currentRuleset");
    sgf.komiElement = document.getElementById("currentKomi");

    sgf.userName = userName;

    sgf.sgfLoadingEvent = new CEvent(sgf.sgfLoadingListener);
    sgf.sgfLoadedEvent = new CEvent(sgf.sgfLoadedListener);

    await sgf.clear(serverKomi, serverRuleset);
};

sgf.clear = async function (serverKomi, serverRuleset) {
    sgf.isSGFLoading = false;
    sgf.isThirdParty = false;

    await sgf.setRuleset(serverKomi != null ? serverKomi : settings.ruleset);
    await sgf.setKomi(serverRuleset ? serverRuleset : settings.komi);

    board.editor.setGameInfo("GoTrainer-HumanAI", "GN");
    board.editor.setGameInfo("GoTrainer-HumanAI", "SO");
    board.editor.setGameInfo(Date(), "DT");

    sgf.setPlayersMeta();
    sgf.setRankPlayerMeta();
    sgf.setRankAIMeta();
    sgf.setHandicapMeta();
};


sgf.boardEditorListener = function (event) {
    if (event.sgfEvent) {
        if (!event.sgfLoaded) {
            sgf.sgfLoadingEvent.dispatch();
        } else {
            sgf.sgfLoadedEvent.dispatch();
        }
    }
};

sgf.sgfLoadingListener = function () {
    sgf.isSGFLoading = true;
};

sgf.sgfLoadedListener = async function () {
    sgf.isThirdParty = true;

    let gameInfo = board.editor.getGameInfo();

    if (gameInfo.RE) {
        stats.setResult(gameInfo.RE);
    }

    G.setColor();

    if (gameInfo.SZ) {
        board.boardsize = parseInt(gameInfo.SZ);
    }

    if (gameInfo.HA) {
        board.setHandicap(parseInt(gameInfo.HA));
    }

    if (confirm("Would you like to use the ruleset and komi of the SGF?")) {
        if (gameInfo.RU) {
            let ruleset = gameInfo.RU.toLowerCase();
            if (ruleset.includes("japan")) {
                await sgf.setRuleset("Japanese");
            } else if (ruleset.includes("chin") || ruleset.includes("korea")) {
                await sgf.setRuleset("Chinese");
            }
        }

        await sgf.setKomi(parseFloat(gameInfo.KM));
    }

    sgf.isSGFLoading = false;
};


sgf.setRuleset = async function (ruleset) {
    sgf.ruleset = ruleset;
    sgf.setRulesetMeta();
    sgf.rulesetElement.innerHTML = ruleset;
    if (G.phase != G.PHASE_TYPE.NONE && G.phase != G.PHASE_TYPE.INIT) await katago.setRuleset();
};

sgf.setKomi = async function (komi) {
    sgf.komi = komi;
    sgf.setKomiMeta();
    sgf.komiElement.innerHTML = komi;
    if (G.phase != G.PHASE_TYPE.NONE && G.phase != G.PHASE_TYPE.INIT) await katago.setKomi();
};


sgf.setPlayersMeta = function () {
    board.editor.setGameInfo(sgf.userName ? sgf.userName : "Player", "P" + G.colorNumToName(G.color));
    board.editor.setGameInfo("AI", "P" + G.colorNumToName(G.color * -1));
};

sgf.setRankPlayerMeta = function () {
    board.editor.setGameInfo(settings.suggestionVisits + "", G.colorNumToName(G.color) + "R");
};

sgf.setRankAIMeta = function () {
    board.editor.setGameInfo(settings.opponentVisits + "", G.colorNumToName(G.color * -1) + "R");
};

sgf.setHandicapMeta = function () {
    board.editor.setGameInfo(board.handicap + "", "HA");
};

sgf.setRulesetMeta = function () {
    board.editor.setGameInfo(sgf.ruleset, "RU");
};

sgf.setKomiMeta = function () {
    board.editor.setGameInfo(sgf.komi + "", "KM");
};

sgf.setResultMeta = function (result) {
    board.editor.setGameInfo(result, "RE");
};
