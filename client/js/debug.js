var debug = {};

debug.testButton = document.getElementById("test");

debug.testButtonClickListener = function() {
    console.log();
};

(function () {

    debug.testButton.addEventListener("click", debug.testButtonClickListener);

})();