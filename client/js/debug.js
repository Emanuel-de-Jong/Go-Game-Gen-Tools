var debug = {};

debug.autoPlayCheckbox = document.getElementById("autoPlay");

debug.autoPlay = function() {
    document.addEventListener("suggestionReady", () => {
        if (debug.autoPlayCheckbox.checked) {
            board.editor.click(1, 1, false, false);
        }
    });
    
    document.addEventListener("nextButtonEnabled", () => {
        if (debug.autoPlayCheckbox.checked) {
            board.nextButton.click();
        }
    });
};


(function () {

    debug.autoPlay();

})();