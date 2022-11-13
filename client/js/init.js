var init = {};


init.init = async function() {
	settings.init();
	board.init();
	preMovePlacer.init();
	await server.init();
	await init.start();
};

init.clear = async function() {
	settings.clear();
	board.clear();
	preMovePlacer.clear();
	await server.clear();
	await init.start();
};


init.start = async function() {
	await preMovePlacer.start();
};


(function () {

	init.init();

})();