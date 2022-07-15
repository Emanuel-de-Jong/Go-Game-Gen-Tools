var board = {};

(function () {

board.element = document.querySelector("#board");
besogo.create(board.element, { resize: "fixed", panels: "control+tree+file" });

board.editor = board.element.besogoEditor;
board.editor.toggleCoordStyle();
board.editor.toggleCoordStyle();
board.editor.setTool("cross");

document.querySelector("input[value=\"9x9\"]").remove();
document.querySelector("input[value=\"13x13\"]").remove();
document.querySelector("input[value=\"19x19\"]").remove();
document.querySelector("input[value=\"?x?\"]").remove();

document.querySelector("button[title=\"Previous node\"]")
    .insertAdjacentHTML("afterend", "<span id=\"moveCount\">0</span>");

board.editor.addListener((event) => {
    if (event.markupChange === true) {
        let markup = board.editor.getCurrent().markup;
        let markupNum;
        for (let i=0; i<markup.length; i++) {
            if (markup[i] == 4) {
                markupNum = i;
                break;
            }
        }
        let coord = {
            x: Math.floor(markupNum / 19) + 1,
            y: (markupNum % 19) + 1
        }
        console.log(coord);

        // let move = editor.getCurrent().move;
        // if (move.color == -1) {
        // 	// turn(move.x, move.y)
        // 	place(bestCoord["x"], bestCoord["y"]);
        // }
    }
});

board.place = function place(x, y, tool = "auto") {
	board.editor.setTool(tool);
	board.editor.click(x, y, false, false);
	board.editor.setTool("cross");

	// if (tool === "auto") {
	// 	document.dispatchEvent(playMove);
	// }
};

})();