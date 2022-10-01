
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
    let y = options.boardsize + 1 - numCoord.y;
    // console.log("server.coordNumToName " + numCoord.x + ", " + numCoord.y + " = " + x + y);
    return "" + x + y;
};

server.coordNameToNum = function(nameCoord) {
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
    let y = options.boardsize + 1 - parseInt(nums[0]);
    let visits = parseInt(nums[1]);
    // console.log("server.coordNameToNum " + nameCoord + " = " + x + ", " + y);
    return { "x": x, "y": y, "visits": visits };
};

server.colorNumToName = function(num) {
    return num == 1 ? "W" : "B";
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
    return fetch(server.URL + "restart?maxVisits=" + options.suggestionStrength, {
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
    return fetch(server.URL + "setboardsize?boardsize=" + options.boardsize, {
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
    return fetch(server.URL + "setrules?ruleset=" + options.ruleset, {
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
    return fetch(server.URL + "setkomi?komi=" + options.komi, {
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
            color: server.colorNumToName(move.color),
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
    return fetch(server.URL + "analyze?color=" + server.colorNumToName(color) + "&moveOptions=" + moveOptions + "&minimumVisits=" + options.minimumVisits, {
        method: "POST" })
        .then(response => response.text())
        .then(nameCoordsText => {
            let numCoords = []
            let nameCoords = JSON.parse(nameCoordsText);
            console.log(nameCoords);

            let isPassed = false;
            nameCoords.forEach(element => {
                if (isPassed) return;
                if (element.includes("pass")) {
                    isPassed = true;
                    return;
                }
                numCoords.push(server.coordNameToNum(element))
            });

            if (isPassed) return "pass";
            return numCoords;
        })
        .catch(error => {
            return error;
        });
};

server.play = async function(color, coord) {
    // console.log("play " + color + " " + server.coordNumToName(coord));
    return fetch(server.URL + "play?color=" + server.colorNumToName(color) + "&coord=" + server.coordNumToName(coord), {
        method: "GET" })
        .then(response => {
            return response;
        })
        .catch(error => {
            return error;
        });
};