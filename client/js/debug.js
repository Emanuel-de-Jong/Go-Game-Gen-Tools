var debug = {};

debug.autoPlay = function() {
    document.addEventListener("suggestionReady", () => {
        board.editor.click(1, 1, false, false);
    })
    
    document.addEventListener("nextButtonEnabled", () => {
        board.nextButton.click();
    })
};


(function () {

    // debug.autoPlay();

})();