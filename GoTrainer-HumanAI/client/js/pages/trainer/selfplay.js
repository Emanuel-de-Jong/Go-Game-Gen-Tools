var selfplay = {};


selfplay.init = async function () {
    selfplay.button = document.getElementById("selfplay");
    selfplay.button.addEventListener("click", selfplay.buttonClickListener);

    selfplay.isPlaying = false;
    selfplay.startPromise = null;

    await selfplay.clear();
};

selfplay.clear = async function () {
    if (selfplay.isPlaying) {
        await selfplay.buttonClickListener();
    }
};


selfplay.start = async function () {
    G.setPhase(G.PHASE_TYPE.SELFPLAY);

    await gameplay.handleJumped();

    while (selfplay.isPlaying || G.color != board.getNextColor()) {
        await G.analyze(settings.selfplayVisits, 1);
        if (G.isPassed) {
            selfplay.button.click();
            return;
        }

        if (!selfplay.isPlaying && G.color == board.getNextColor()) return;

        await board.play(G.suggestions.get(0), G.MOVE_TYPE.SELFPLAY);
    }
};

selfplay.buttonClickListener = async function () {
    if (!selfplay.isPlaying) {
        selfplay.isPlaying = true;
        selfplay.button.innerHTML = "Stop selfplay";

        gameplay.takePlayerControl();
        board.nextButton.disabled = true;

        selfplay.startPromise = selfplay.start();
    } else {
        selfplay.isPlaying = false;
        selfplay.button.innerHTML = "Start selfplay";

        await selfplay.startPromise;

        if (!G.isPassed && !sgf.isSGFLoading) {
            gameplay.givePlayerControl();
        }
    }
};
