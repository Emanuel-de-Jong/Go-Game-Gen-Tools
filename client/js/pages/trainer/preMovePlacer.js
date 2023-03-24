var preMovePlacer = {};


preMovePlacer.MIN_VISITS_PERC = 10;
preMovePlacer.MAX_VISIT_DIFF_PERC = 50;


preMovePlacer.init = function () {
    preMovePlacer.stopButton = document.getElementById("stopPreMoves");
    preMovePlacer.stopButton.addEventListener("click", preMovePlacer.stopButtonClickListener);

    preMovePlacer.clear();
};

preMovePlacer.clear = function () {
    preMovePlacer.isStopped = true;
};


preMovePlacer.start = async function () {
    G.setPhase(G.PHASE_TYPE.PREMOVES);

    preMovePlacer.isStopped = false;

    preMovePlacer.stopButton.hidden = false;
    selfplay.button.hidden = true;

    if (settings.preMovesSwitch) {
        for (let i = 0; i < settings.preMoves; i++) {
            if (preMovePlacer.isStopped) break;

            if (cornerPlacer.shouldForce()) {
                let suggestion = await cornerPlacer.getSuggestion();
                if (preMovePlacer.isStopped) break;

                await cornerPlacer.play(suggestion);
            } else {
                await preMovePlacer.play();
            }
        }
    }

    while (G.color != board.getNextColor() && !G.isPassed && !sgf.isSGFLoading) {
        await preMovePlacer.play(true);
    }

    preMovePlacer.stopButton.hidden = true;
    selfplay.button.hidden = false;

    if (!G.isPassed && !sgf.isSGFLoading) {
        gameplay.givePlayerControl();
    }
};

preMovePlacer.stopButtonClickListener = function () {
    preMovePlacer.isStopped = true;
};

preMovePlacer.play = async function (isForced = false) {
    if (!isForced && preMovePlacer.isStopped) return;

    let preOptions = 1;
    if (board.getNextColor() != G.color && utils.randomInt(100) + 1 <= settings.preOptionPerc) {
        preOptions = settings.preOptions;
    }

    await G.analyze(settings.preVisits, preOptions, preMovePlacer.MIN_VISITS_PERC, preMovePlacer.MAX_VISIT_DIFF_PERC);
    if (G.isPassed) preMovePlacer.isStopped = true;
    if (!isForced && preMovePlacer.isStopped) return;

    await board.play(G.suggestions.get(utils.randomInt(G.suggestions.length())), G.MOVE_TYPE.PRE);
};
