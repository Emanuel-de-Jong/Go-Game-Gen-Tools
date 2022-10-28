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


selfplay.start = async function() {
	await main.handleJumped();

	while (selfplay.isPlaying || settings.color != board.getNextColor()) {
		await main.analyze(settings.selfplayVisits, 1);
		if (main.isPassed) {
			selfplay.button.click();
			return;
		}

		if (!selfplay.isPlaying && settings.color == board.getNextColor()) return;

		await board.play(main.suggestions.get(0), utils.MOVE_TYPE.SELFPLAY);
	}
};

selfplay.buttonClickListener = async function() {
	if (!selfplay.isPlaying) {
		selfplay.isPlaying = true;
		selfplay.button.innerHTML = "Stop selfplay";

		main.takePlayerControl();
		board.nextButton.disabled = true;

		selfplay.startPromise = selfplay.start();
	} else {
		selfplay.isPlaying = false;
		selfplay.button.innerHTML = "Start selfplay";

		await selfplay.startPromise;

		if (!main.isPassed) {
			main.givePlayerControl();
		}
	}
};