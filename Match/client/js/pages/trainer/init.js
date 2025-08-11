var init = {};


init.init = async function (
    trainerRef,
    rcKataGoWrapperRef,
    userName,
    kataGoVersion,

    serverBoardsize,
    serverHandicap,
    serverColor,
    serverKomi,
    serverRuleset,
    serverSGF,
    serverRatios,
    serverSuggestions,
    serverMoveTypes,
    serverChosenNotPlayedCoords
) {
    G.isLoadingServerData = serverSGF != null;

    if (G.isLoadingServerData) {
        debug.testData = 0;
    }

    // console.log(serverBoardsize);
    // console.log(serverHandicap);
    // console.log(serverColor);
    // console.log(serverKomi);
    // console.log(serverRuleset);
    // console.log(serverSGF);
    // console.log(serverRatios);
    // console.log(serverSuggestions);
    // console.log(serverMoveTypes);
    // console.log(serverChosenNotPlayedCoords);

    G.init(trainerRef, rcKataGoWrapperRef, kataGoVersion, serverSuggestions, serverMoveTypes);
    G.setPhase(G.PHASE_TYPE.INIT);

    init.restartButton = document.getElementById("restart");
    init.restartButton.addEventListener("click", init.restartButtonClickListener);

    settings.init(serverColor);
    board.init(serverBoardsize, serverHandicap, serverSGF);
    await sgf.init(userName, serverKomi, serverRuleset);
    sgfComment.init();
    scoreChart.init();
    stats.init(serverRatios);
    debug.init();
    gameplay.init(serverChosenNotPlayedCoords);
    cornerPlacer.init();
    preMovePlacer.init();
    await selfplay.init();
    await katago.init();
    db.init();

    // console.log(stats.ratioHistory);
    // console.log(G.suggestionsHistory);
    // console.log(G.moveTypeHistory);
    // console.log(gameplay.chosenNotPlayedCoordHistory);
    // console.log(scoreChart.history);

    sgf.sgfLoadingEvent.add(init.sgfLoadingListener);
    sgf.sgfLoadedEvent.add(init.sgfLoadedListener);

    await init.start();
};

init.clear = async function () {
    G.setPhase(G.PHASE_TYPE.INIT);

    G.clear();
    settings.clear();
    board.clear();
    await sgf.clear();
    sgfComment.clear();
    scoreChart.clear();
    stats.clear();
    debug.clear();
    gameplay.clear();
    cornerPlacer.clear();
    preMovePlacer.clear();
    await selfplay.clear();
    await katago.clear();
    db.clear();

    await init.start();
};


init.start = async function () {
    if (G.isLoadingServerData || debug.testData) {
        G.isLoadingServerData = false;
        gameplay.givePlayerControl(false);
    } else {
        await preMovePlacer.start();
    }
};

init.restartButtonClickListener = async function () {
    await init.clear();
};

init.sgfLoadingListener = async function () {
    preMovePlacer.clear();
    await selfplay.clear();
    G.clear();
};

init.sgfLoadedListener = async function () {
    sgfComment.clear();
    scoreChart.clear();
    stats.clear();
    gameplay.clear();

    await katago.clearBoard();
    await katago.setBoardsize();
    await katago.setHandicap();

    gameplay.givePlayerControl();
};
