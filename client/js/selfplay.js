var selfplay = {};


selfplay.init = function() {
	selfplay.button = document.getElementById("selfplay");

	selfplay.button.addEventListener("click", selfplay.buttonClickListener);
	
    selfplay.clear();
};

selfplay.clear = function() {
	selfplay.isPlaying = false;
	selfplay.startPromise = null;
};


selfplay.start = async function () {
	G.setPhase(G.PHASE_TYPE.SELFPLAY);

	await gameplay.handleJumped();

	while (selfplay.isPlaying || settings.color != board.getNextColor()) {
		await G.analyze(settings.selfplayVisits, 1);
		if (G.isPassed) {
			selfplay.button.click();
			return;
		}

		if (!selfplay.isPlaying && settings.color == board.getNextColor()) return;

		await board.play(G.suggestions.get(0), G.MOVE_TYPE.SELFPLAY);
	}
};

selfplay.buttonClickListener = async function() {
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

		if (!G.isPassed) {
			gameplay.givePlayerControl();
		}
	}
};