var init = {};


init.init = async function (dotNetRef) {
	G.init(dotNetRef);
	G.setPhase(G.PHASE_TYPE.INIT);

	init.restartButton = document.getElementById("restart");

	init.restartButton.addEventListener("click", init.restartButtonClickListener);

	settings.init();
	board.init();
	await sgf.init();
	sgfComment.init();
	scoreChart.init();
	stats.init();
	debug.init();
	gameplay.init();
	cornerPlacer.init();
	preMovePlacer.init();
	await selfplay.init();
	await katago.init();
	db.init();

	sgf.sgfLoadingEvent.add(init.sgfLoadingListener);
	sgf.sgfLoadedEvent.add(init.sgfLoadedListener);

	await init.start();
};

init.clear = async function() {
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


init.start = async function() {
	await preMovePlacer.start();
};

init.restartButtonClickListener = async function() {
	await init.clear();
};

init.sgfLoadingListener = async function() {
	preMovePlacer.clear();
	await selfplay.clear();
	G.clear();
};

init.sgfLoadedListener = async function() {
	sgfComment.clear();
	scoreChart.clear();
	stats.clear();
	gameplay.clear();

	await katago.clearBoard();
	await katago.setBoardsize();
	await katago.setHandicap();

	gameplay.givePlayerControl();
};


(function () {

	init.init();

})();