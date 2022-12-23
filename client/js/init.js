var init = {};


init.init = async function (dotNetRef) {
	G.init(dotNetRef);
	G.setPhase(G.PHASE_TYPE.INIT);

	init.restartButton = document.getElementById("restart");

	init.restartButton.addEventListener("click", init.restartButtonClickListener);

	settings.init();
	board.init();
	sgf.init();
	sgfComment.init();
	scoreChart.init();
	stats.init();
	debug.init();
	gameplay.init();
	preMovePlacer.init();
	selfplay.init();
	await katago.init();

	sgf.sgfLoadedEvent.add(init.sgfLoadedListener);

	await init.start();
};

init.clear = async function() {
	G.clear();
	settings.clear();
	board.clear();
	sgf.clear();
	sgfComment.clear();
	scoreChart.clear();
	stats.clear();
	debug.clear();
	gameplay.clear();
	preMovePlacer.clear();
	selfplay.clear();
	await katago.clear();
	await init.start();
};


init.start = async function() {
	await board.placeHandicap();

	await preMovePlacer.start();
};

init.restartButtonClickListener = async function() {
	await init.clear();
};

init.sgfLoadedListener = async function() {
	G.clear();
	sgfComment.clear();
	scoreChart.clear();
	stats.clear();
	gameplay.clear();
	await katago.clear();
	await preMovePlacer.clear();
	await selfplay.clear();
};


(function () {

	init.init();

})();