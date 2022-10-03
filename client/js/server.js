
var server = {};

server.URL = "http://localhost:9191/kata/";

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

server.init = async function() {
    let status;
    do {
        status = (await server.restart()).status;
    } while (status != 200);
    await server.setBoardsize();
    await server.setRules();
    await server.setKomi();
};

server.restart = async function() {
    // console.log("restart");
    return fetch(server.URL + "restart?maxVisits=" + settings.suggestionStrength, {
        method: "GET" })
        .then(response => {
            return response;
        })
        .catch(error => {
            return error;
        });
};

server.setBoardsize = async function() {
    // console.log("setBoardsize");
    return fetch(server.URL + "setboardsize?boardsize=" + settings.boardsize, {
        method: "GET" })
        .then(response => {
            return response;
        })
        .catch(error => {
            return error;
        });
};

server.setRules = async function() {
    // console.log("setRules");
    return fetch(server.URL + "setrules?ruleset=" + settings.ruleset, {
        method: "GET" })
        .then(response => {
            return response;
        })
        .catch(error => {
            return error;
        });
};

server.setKomi = async function() {
    // console.log("setKomi");
    return fetch(server.URL + "setkomi?komi=" + settings.komi, {
        method: "GET" })
        .then(response => {
            return response;
        })
        .catch(error => {
            return error;
        });
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

    return fetch(server.URL + "setboard", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: '{"moves":' + JSON.stringify(serverMoves) + "}" })
        .then(response => {
            return response;
        })
        .catch(error => {
            return error;
        });
};

server.analyze = async function(color, moveOptions) {
    // console.log("analyze " + color);
    return fetch(server.URL + "analyze?color=" + utils.colorNumToName(color) + "&moveOptions=" + moveOptions + "&minimumVisits=" + settings.minimumVisits, {
        method: "POST" })
        .then(response => response.json())
        .then(suggestionArr => {
            let suggestions = [];
            let nameCoords = [];
            let isPassed = false;
            suggestionArr.forEach(suggestion => {
                if (isPassed) return;
                if (suggestion.move.coord == "pass") {
                    isPassed = true;
                }

                nameCoords.push(suggestion.move.coord);

                suggestions.push(new MoveSuggestion(
                    utils.colorNameToNum(suggestion.move.color),
                    server.coordNameToNum(suggestion.move.coord),
                    suggestion.visits,
                    suggestion.winrate,
                    suggestion.scoreLead));
            });

            console.log(nameCoords);
            // console.log(suggestions);

            return suggestions;
        })
        .catch(error => {
            return error;
        });
};

server.play = async function(color, coord) {
    // console.log("play " + color + " " + server.coordNumToName(coord));
    return fetch(server.URL + "play?color=" + utils.colorNumToName(color) + "&coord=" + server.coordNumToName(coord), {
        method: "GET" })
        .then(response => {
            return response;
        })
        .catch(error => {
            return error;
        });
};