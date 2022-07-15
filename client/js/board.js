var board = {};

(function () {

board.element = document.querySelector("#board");
besogo.create(board.element, { resize: "fixed", panels: "control+tree+file" });

board.editor = board.element.besogoEditor;
board.editor.toggleVariantStyle();
board.editor.toggleCoordStyle();
board.editor.toggleCoordStyle();
board.editor.setTool("navOnly");

document.querySelector("button[title=\"Variants: [show]/hide\"]").remove();
document.querySelector("input[value=\"9x9\"]").remove();
document.querySelector("input[value=\"13x13\"]").remove();
document.querySelector("input[value=\"19x19\"]").remove();
document.querySelector("input[value=\"?x?\"]").remove();

document.querySelector("button[title=\"Previous node\"]")
    .insertAdjacentHTML("afterend", "<span id=\"moveCount\">0</span>");

board.draw = function(coord, tool = "auto") {
	board.editor.setTool(tool);
	board.editor.click(coord.x, coord.y, false, false);
	board.editor.setTool("navOnly");

	// if (tool === "auto") {
	// 	document.dispatchEvent(playMove);
	// }
};

board.drawCoords = function(coords) {
	board.editor.setTool("label");
	board.editor.setLabel("A");
	coords.forEach(coord => {
		board.editor.click(coord.x, coord.y, false, false);
	});
	board.editor.setTool("navOnly");
}

board.markupToCoord = function(boardW = 19, boardH = 19) {
	let markup = board.editor.getCurrent().markup;
	let markupNum;
	for (let i=0; i<markup.length; i++) {
		if (markup[i] == 4) {
			markupNum = i;
			break;
		}
	}

	return {
		x: Math.floor(markupNum / boardW) + 1,
		y: (markupNum % boardH) + 1
	}
}

})();