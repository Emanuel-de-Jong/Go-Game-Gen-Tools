var debug = {};

debug.autoPlayCheckbox = document.getElementById("autoPlay");
debug.testButton = document.getElementById("test");

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

    debug.testButton.addEventListener("click", () => {
        console.log();
    });

    debug.autoPlay();

})();