var selfplay = {};


selfplay.selfplayButton = document.getElementById("selfplay");


selfplay.init = async function() {
    await selfplay.clear();
};

selfplay.clear = async function() {
	selfplay.isSelfplay = false;
	selfplay.selfplayPromise = null;
};


selfplay.selfplay = async function() {
	while (selfplay.isSelfplay || settings.color != board.getNextColor()) {
		await main.analyze(settings.selfplayVisits, 1);
		if (main.isPassed) {
			selfplay.selfplayButton.click();
			return;
		}

		if (!selfplay.isSelfplay && settings.color == board.getNextColor()) return;

		await board.play(main.suggestions.get(0), selfplay.createSelfplayComment());
	}
};

selfplay.createSelfplayComment = function() {
	return "Selfplay move" +
	"\nStrength: " + settings.selfplayVisits +
	main.createCommentGrades();
};

selfplay.selfplayButtonClickListener = async function() {
	if (!selfplay.isSelfplay) {
		selfplay.isSelfplay = true;
		selfplay.selfplayButton.innerHTML = "Stop selfplay";

		main.takePlayerControl();
		board.nextButton.disabled = true;

		selfplay.selfplayPromise = selfplay.selfplay();
	} else {
		selfplay.isSelfplay = false;
		selfplay.selfplayButton.innerHTML = "Start selfplay";

		await selfplay.selfplayPromise;

		if (!main.isPassed) {
			main.givePlayerControl();
		}
	}
};
selfplay.selfplayButton.addEventListener("click", selfplay.selfplayButtonClickListener);