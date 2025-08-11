var katago = {};


katago.URL = "https://localhost:5001/kata/";


katago.init = async function () {
    await katago.clear();
};

katago.clear = async function () {
    let status;
    do {
        status = (await katago.restart()).status;
    } while (status != 200);
    await katago.setBoardsize();
    await katago.setRuleset();
    await katago.setKomi();
    await katago.setHandicap();
};


katago.clearBoard = async function () {
    if (G.LOG) console.log("katago.clearBoard");

    return katago.sendRequest(fetch(katago.URL + "clearboard", {
        method: "GET" })
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        }));
};

katago.restart = async function () {
    if (G.LOG) console.log("katago.restart");

    return katago.sendRequest(fetch(katago.URL + "restart", {
        method: "GET" })
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        }));
};

katago.setBoardsize = async function () {
    if (G.LOG) console.log("katago.setBoardsize " + board.boardsize);

    return katago.sendRequest(fetch(katago.URL + "setboardsize?boardsize=" + board.boardsize, {
        method: "GET" })
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        }));
};

katago.setRuleset = async function () {
    if (G.LOG) console.log("katago.setRuleset " + sgf.ruleset);

    return katago.sendRequest(fetch(katago.URL + "setruleset?ruleset=" + sgf.ruleset, {
        method: "GET" })
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        }));
};

katago.setKomi = async function () {
    if (G.LOG) console.log("katago.setKomi " + sgf.komi);

    return katago.sendRequest(fetch(katago.URL + "setkomi?komi=" + sgf.komi, {
        method: "GET" })
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        }));
};

katago.setHandicap = async function () {
    if (!board.handicap) return;

    if (G.LOG) console.log("katago.setHandicap " + board.handicap);

    return katago.sendRequest(fetch(katago.URL + "sethandicap?handicap=" + board.handicap, {
        method: "GET" })
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        }));
};

katago.analyzeMove = async function (coord, color = board.getNextColor()) {
    if (G.LOG) console.log("katago.analyzeMove " + G.colorNumToName(color) + " " + katago.coordNumToName(coord));

    return katago.sendRequest(fetch(katago.URL + "analyzemove?color=" + G.colorNumToName(color) +
            "&coord=" + katago.coordNumToName(coord), {
        method: "POST" })
        .then((response) => response.json())
        .then((kataGoSuggestion) => {
            return MoveSuggestion.fromKataGo(kataGoSuggestion);
        })
        .catch((error) => {
            return error;
        }));
};

katago.analyze = async function (
    maxVisits = settings.suggestionVisits,
    moveOptions = settings.suggestionOptions,
    minVisitsPerc = settings.minVisitsPerc,
    maxVisitDiffPerc = settings.maxVisitDiffPerc,
    color = board.getNextColor()
) {
    minVisitsPerc = settings.minVisitsPercSwitch ? minVisitsPerc : 0;
    maxVisitDiffPerc = settings.maxVisitDiffPercSwitch ? maxVisitDiffPerc : 100;

    if (G.LOG)
        console.log(
            "katago.analyze " +
                maxVisits + " " +
                moveOptions + " " +
                minVisitsPerc + " " +
                maxVisitDiffPerc + " " +
                color
        );

    return katago.sendRequest(fetch(katago.URL + "analyze?color=" + G.colorNumToName(color) +
            "&maxVisits=" + maxVisits +
            "&minVisitsPerc=" + minVisitsPerc +
            "&maxVisitDiffPerc=" + maxVisitDiffPerc, {
        method: "POST" })
        .then((response) => response.json())
        .then((kataGoSuggestions) => {
            let suggestions = MoveSuggestionList.fromKataGo(kataGoSuggestions);
            suggestions.filterByPass();
            suggestions.filterByMoveOptions(moveOptions);
            suggestions.addGrades();
            return suggestions;
        })
        .catch((error) => {
            return error;
        }));
};

katago.play = async function (coord, color = board.getColor()) {
    if (G.LOG) console.log("katago.play " + G.colorNumToName(color) + " " + katago.coordNumToName(coord));

    return katago.sendRequest(fetch(katago.URL + "play?color=" + G.colorNumToName(color) + "&coord=" + katago.coordNumToName(coord), {
        method: "GET" })
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        }));
};

katago.playRange = async function () {
    let moves = board.getMoves();
    if (moves.length == 0) return;

    let serverMoves = {
        moves: [],
    };

    for (let i = 0; i < moves.length; i++) {
        let move = moves[i];
        serverMoves.moves.push({
            color: G.colorNumToName(move.color),
            coord: katago.coordNumToName(move.coord),
        });
    }

    if (G.LOG) console.log("katago.playRange " + serverMoves);

    return katago.sendRequest(fetch(katago.URL + "playrange", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverMoves) })
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        }));
};

katago.sgf = async function () {
    if (G.LOG) console.log("katago.sgf " + true);

    return katago.sendRequest(fetch(katago.URL + "sgf?shouldWriteFile=" + true, {
        method: "GET" })
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        }));
};

katago.sendRequest = async function (request) {
    // Before
    let response = await request;
    // After
    return response;
};

katago.coordNumToName = function (numCoord) {
    if (numCoord.x == 0) return "pass";

    let xConvert = {
        1: "A",
        2: "B",
        3: "C",
        4: "D",
        5: "E",
        6: "F",
        7: "G",
        8: "H",
        9: "J",
        10: "K",
        11: "L",
        12: "M",
        13: "N",
        14: "O",
        15: "P",
        16: "Q",
        17: "R",
        18: "S",
        19: "T",
    };

    let x = xConvert[numCoord.x];
    let y = board.boardsize + 1 - numCoord.y;
    return "" + x + y;
};

katago.coordNameToNum = function (nameCoord) {
    if (nameCoord == "pass") return new Coord(0, 0);

    let xConvert = {
        A: 1,
        B: 2,
        C: 3,
        D: 4,
        E: 5,
        F: 6,
        G: 7,
        H: 8,
        J: 9,
        K: 10,
        L: 11,
        M: 12,
        N: 13,
        O: 14,
        P: 15,
        Q: 16,
        R: 17,
        S: 18,
        T: 19,
    };

    let nums = nameCoord.substring(1).split(" ");

    let x = xConvert[nameCoord[0]];
    let y = board.boardsize + 1 - parseInt(nums[0]);
    return new Coord(x, y);
};
