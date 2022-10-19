var init = {};


init.init = async function() {
	await settings.init();
	await server.init();
	await board.init();
	await sgf.init();
	await scoreChart.init();
	await stats.init();
	await debug.init();
	await main.init();
	await init.start();
};

init.clear = async function() {
	await settings.clear();
	await server.clear();
	await board.clear();
	await sgf.clear();
	await scoreChart.clear();
	await stats.clear();
	await debug.clear();
	await main.clear();
	await init.start();
};


init.start = async function() {
	await main.createPreMoves();
};

init.restartButtonClickListener = async function() {
	await init.clear();
};
document.getElementById("restart").addEventListener("click", init.restartButtonClickListener);


(function () {

	init.init();

})();