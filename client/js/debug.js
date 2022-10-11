var debug = {};

debug.testButton = document.getElementById("test");

debug.testButtonClickListener = async function() {
    if (settings.analyzeAllMoves) {
        console.log(await server.analyzeMove(settings.analysisStrength, board.nextColor(), new Coord(9, 9)));
    } else {
        console.log("disabled");
    }
};

debug.logAllFuncCalls = function() {
    let objs = [
        board,
        custom,
        debug,
        server,
        settings,
        stats,
        utils,
    ];
    
    for (let i=0; i<objs.length; i++) {
        let obj = objs[i];
        let funcNames = Object.getOwnPropertyNames(obj).filter(item => typeof obj[item] === 'function');
        for (let j=0; j<funcNames.length; j++) {
            let funcName = funcNames[j];

            obj[funcName] = (function() {
                let cachedFunc = obj[funcName];
                
                return function() {
                    let log = funcName + "(";
                    for (let x=0; x<arguments.length; x++) {
                        let argument = arguments[x];
                        switch (typeof argument) {
                            case "object":
                                log += "obj";
                                break;
                            case "function":
                                log += "func";
                                break;
                            default:
                                log += argument;
                        }

                        if (x != arguments.length - 1) {
                            log += ", ";
                        }
                    }
                    log += ")";
                    console.log(log);

                    let result = cachedFunc.apply(this, arguments);
                    return result;
                }
            })();
        }
    }
};

(function () {

    debug.testButton.addEventListener("click", debug.testButtonClickListener);
    // debug.logAllFuncCalls();

})();