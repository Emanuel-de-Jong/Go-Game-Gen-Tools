var init = {};


init.init = async function() {
	init.restartButton = document.getElementById("restart");

	init.restartButton.addEventListener("click", init.restartButtonClickListener);
	document.addEventListener("sgfLoadedEvent", init.sgfLoadedEventListener);

	settings.init();
	board.init();
	sgf.init();
	scoreChart.init();
	stats.init();
	debug.init();
	main.init();
	preMovePlacer.init();
	selfplay.init();
	await server.init();
	await init.start();
};

init.clear = async function() {
	settings.clear();
	board.clear();
	sgf.clear();
	scoreChart.clear();
	stats.clear();
	debug.clear();
	main.clear();
	preMovePlacer.clear();
	selfplay.clear();
	await server.clear();
	await init.start();
};


init.start = async function() {
	await preMovePlacer.start();
};

init.restartButtonClickListener = async function() {
	await init.clear();
};

init.sgfLoadedEventListener = async function() {
	scoreChart.clear();
	stats.clear();
	main.clear();
	await server.clear();
	await preMovePlacer.clear();
	await selfplay.clear();
};


(function () {

	init.init();

})();