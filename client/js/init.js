var init = {};

init.init = async function() {
    settings.init();
    await init.clear(utils.SOURCE.INIT);
	debug.init();
};

init.clear = async function(source) {
    if (source !== utils.SOURCE.MAIN) main.clear();

    if (source !== utils.SOURCE.SERVER) await server.clear();

	if (source !== utils.SOURCE.STATS) stats.clear();

	if (source !== utils.SOURCE.BOARD) {
		await board.clear();
		board.editor.addListener(main.boardEditorListener);
		board.nextButton.addEventListener("click", main.nextButtonClickListener);

		main.stopPreMovesButton.hidden = false;
		main.selfplayButton.hidden = true;
		await main.createPreMoves();
	}
};

init.restartButtonClickListener = async function() {
	await init.clear(utils.SOURCE.INIT);
};
document.getElementById("restart").addEventListener("click", init.restartButtonClickListener);


(function () {

	init.init();

})();