const SERVER_URL = "http://localhost:8080/kata/";

function coordNumToName(numCoord) {
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
    // console.log("coordNumToName " + numCoord.x + ", " + numCoord.y + " = " + x + y);
    return "" + x + y;
}

function coordNameToNum(nameCoord) {
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

    let x = xConvert[nameCoord[0]];
    let y = options.boardsize + 1 - parseInt(nameCoord.substring(1));
    // console.log("coordNameToNum " + nameCoord + " = " + x + ", " + y);
    return { "x": x, "y": y };
}

function colorNumToName(num) {
    return num == 1 ? "W" : "B";
}

var server = {};

server.init = async function() {
    await server.restart();
    await server.setBoardsize();
    await server.setRules();
    await server.setKomi();
}

server.restart = async function() {
    // console.log("restart");
    return fetch(SERVER_URL + "restart", {
        method: "GET" });
};

server.setBoardsize = async function() {
    // console.log("setBoardsize");
    return fetch(SERVER_URL + "setboardsize?boardsize=" + options.boardsize, {
        method: "GET" });
};

server.setRules = async function() {
    // console.log("setRules");
    return fetch(SERVER_URL + "setrules?ruleset=" + options.ruleset, {
        method: "GET" });
};

server.setKomi = async function() {
    // console.log("setKomi");
    return fetch(SERVER_URL + "setkomi?komi=" + options.komi, {
        method: "GET" });
};

server.genmove = async function(color) {
    // console.log("genmove");
    return fetch(SERVER_URL + "genmove?color=" + colorNumToName(color), {
        method: "GET" })
        .then(response => response.text())
        .then(coord => {
            return coordNameToNum(coord);
        });
};

server.analyze = async function(color, moveOptions = options.moveOptions, strength = options.strength) {
    // console.log("analyze");
    let moves = board.getMoves();
    let serverMoves = [];
    moves.forEach(move => {
        serverMoves.push({
            color: colorNumToName(move.color),
            coord: coordNumToName(move.coord)
        });
    });

    return fetch(SERVER_URL + "analyze?color=" + colorNumToName(color) + "&moveOptions=" + moveOptions + "&strength=" + strength, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: '{"moves":' + JSON.stringify(serverMoves) + "}" })
        .then(response => response.text())
        .then(nameCoordsText => {
            let numCoords = []
            let nameCoords = JSON.parse(nameCoordsText);
            console.log(nameCoords);
            nameCoords.forEach(element => {
                numCoords.push(coordNameToNum(element))
            });
            return numCoords;
        });
};

server.play = async function(numCoord, color) {
    // console.log("play");
    let nameCoord = coordNumToName(numCoord);
    return fetch(SERVER_URL + "play?color=" + colorNumToName(color) + "&coord=" + nameCoord, {
        method: "GET" });
};