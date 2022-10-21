var init = {};


init.restartButton = document.getElementById("restart");


init.init = async function() {
	settings.init();
	await board.init();
	sgf.init();
	scoreChart.init();
	stats.init();
	debug.init();
	main.init();
	await server.init();
	await preMovePlacer.init();
	await selfplay.init();
	await init.start();
};

init.clear = async function() {
	settings.clear();
	await board.clear();
	sgf.clear();
	scoreChart.clear();
	stats.clear();
	debug.clear();
	main.clear();
	await server.clear();
	await preMovePlacer.clear();
	await selfplay.clear();
	await init.start();
};


init.start = async function() {
	await preMovePlacer.createPreMoves();
};

init.restartButtonClickListener = async function() {
	await init.clear();
};
init.restartButton.addEventListener("click", init.restartButtonClickListener);


(function () {

	init.init();

})();