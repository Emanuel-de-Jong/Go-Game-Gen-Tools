var server = {};


server.URL = "http://localhost:9191/kata/";


server.init = async function() {
    await server.clear();
};

server.clear = async function() {
    let status;
    do {
        status = (await server.restart()).status;
    } while (status != 200);
    await server.setBoardsize();
    await server.setRuleset();
    await server.setKomi();
};


server.restart = async function() {
    // console.log("restart");
    return server.sendRequest(fetch(server.URL + "restart", {
        method: "GET" })
        .then(response => {
            return response;
        })
        .catch(error => {
            return error;
        }));
};

server.setBoardsize = async function() {
    // console.log("setBoardsize");
    return server.sendRequest(fetch(server.URL + "setboardsize?boardsize=" + settings.boardsize, {
        method: "GET" })
        .then(response => {
            return response;
        })
        .catch(error => {
            return error;
        }));
};

server.setRuleset = async function() {
    // console.log("setRuleset");
    return server.sendRequest(fetch(server.URL + "setruleset?ruleset=" + settings.ruleset, {
        method: "GET" })
        .then(response => {
            return response;
        })
        .catch(error => {
            return error;
        }));
};

server.setKomi = async function() {
    // console.log("setKomi");
    return server.sendRequest(fetch(server.URL + "setkomi?komi=" + settings.komi, {
        method: "GET" })
        .then(response => {
            return response;
        })
        .catch(error => {
            return error;
        }));
};

server.analyzeMove = async function(coord, color = board.getNextColor()) {
    return server.sendRequest(fetch(server.URL + "analyzemove?color=" + utils.colorNumToName(color) +
            "&coord=" + server.coordNumToName(coord), {
        method: "POST" })
        .then(response => response.json())
        .then(serverSuggestion => {
            return new MoveSuggestion(serverSuggestion);
        })
        .catch(error => {
            return error;
        }));
};

server.analyze = async function(
        maxVisits = settings.suggestionVisits,
        moveOptions = settings.suggestionOptions,
        minVisitsPerc = settings.minVisitsPerc,
        maxVisitDiffPerc = settings.maxVisitDiffPerc,
        color = board.getNextColor()) {
    // console.log("analyze " + maxVisits + " " + moveOptions + " " + minVisitsPerc + " " + maxVisitDiffPerc + " " + color);
    
    minVisitsPerc = settings.minVisitsPercSwitch ? minVisitsPerc : 0;
    maxVisitDiffPerc = settings.maxVisitDiffPercSwitch ? maxVisitDiffPerc : 100;

    return await server.sendRequest(fetch(server.URL + "analyze?color=" + utils.colorNumToName(color) +
            "&maxVisits=" + maxVisits +
            "&minVisitsPerc=" + minVisitsPerc +
            "&maxVisitDiffPerc=" + maxVisitDiffPerc, {
        method: "POST" })
        .then(response => response.json())
        .then(serverSuggestions => {
            let suggestions = new MoveSuggestionList(serverSuggestions);
            suggestions.filterByPass();
            suggestions.filterByMoveOptions(moveOptions);
            suggestions.addGrades();
            return suggestions;
        })
        .catch(error => {
            return error;
        }));
};

server.play = async function(coord, color = board.getColor()) {
    // console.log("play " + color + " " + server.coordNumToName(coord));
    return server.sendRequest(fetch(server.URL + "play?color=" + utils.colorNumToName(color) + "&coord=" + server.coordNumToName(coord), {
        method: "GET" })
        .then(response => {
            return response;
        })
        .catch(error => {
            return error;
        }));
};

server.setBoard = async function() {
    // console.log("setBoard");
    let moves = board.getMoves();
    let serverMoves = [];
    moves.forEach(move => {
        serverMoves.push({
            color: utils.colorNumToName(move.color),
            coord: server.coordNumToName(move.coord)
        });
    });

    return server.sendRequest(fetch(server.URL + "setboard", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: '{"moves":' + JSON.stringify(serverMoves) + "}" })
        .then(response => {
            return response;
        })
        .catch(error => {
            return error;
        }));
};

server.sgf = async function() {
    return server.sendRequest(fetch(server.URL + "sgf", {
        method: "GET" })
        .then(response => {
            return response;
        })
        .catch(error => {
            return error;
        }));
};

server.sendRequest = async function(request) {
    // before
    let response = await request;
    // after
    return response;
};

server.coordNumToName = function(numCoord) {
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
        19: "T"
    };

    let x = xConvert[numCoord.x];
    let y = settings.boardsize + 1 - numCoord.y;
    // console.log("server.coordNumToName " + numCoord.x + ", " + numCoord.y + " = " + x + y);
    return "" + x + y;
};

server.coordNameToNum = function(nameCoord) {
    if (nameCoord == "pass") return nameCoord;

    let xConvert = {
        "A": 1,
        "B": 2,
        "C": 3,
        "D": 4,
        "E": 5,
        "F": 6,
        "G": 7,
        "H": 8,
        "J": 9,
        "K": 10,
        "L": 11,
        "M": 12,
        "N": 13,
        "O": 14,
        "P": 15,
        "Q": 16,
        "R": 17,
        "S": 18,
        "T": 19
    };

    let nums = nameCoord.substring(1).split(" ");
    
    let x = xConvert[nameCoord[0]];
    let y = settings.boardsize + 1 - parseInt(nums[0]);
    return new Coord(x, y);
};