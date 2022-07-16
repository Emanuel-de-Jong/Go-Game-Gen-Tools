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
    let yConvert = {
        1: 19,
        2: 18,
        3: 17,
        4: 16,
        5: 15,
        6: 14,
        7: 13,
        8: 12,
        9: 11,
        10: 10,
        11: 9,
        12: 8,
        13: 7,
        14: 6,
        15: 5,
        16: 4,
        17: 3,
        18: 2,
        19: 1
    };

    let nameCoord = "" + xConvert[numCoord.x] + yConvert[numCoord.y];
    // console.log("coordNumToName " + x + ", " + y + " = " + coord);
    return nameCoord;
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
    let yConvert = {
        19: 1,
        18: 2,
        17: 3,
        16: 4,
        15: 5,
        14: 6,
        13: 7,
        12: 8,
        11: 9,
        10: 10,
        9: 11,
        8: 12,
        7: 13,
        6: 14,
        5: 15,
        4: 16,
        3: 17,
        2: 18,
        1: 19,
    };

    let x = xConvert[nameCoord[0]];
    let y = yConvert[parseInt(nameCoord.substring(1))];
    // console.log("coordNameToNum " + coord + " = " + x + ", " + y);
    return { "x": x, "y": y };
}

function colorNumToName(num) {
    return num == 1 ? "W" : "B";
}

var server = {};

server.restart = async function() {
    // console.log("restart");
    return fetch(SERVER_URL + "restart",
        { method: "GET" })
};

server.setRules = async function(ruleset) {
    // console.log("setRules");
    return fetch(SERVER_URL + "setrules?ruleset=" + ruleset,
        { method: "GET" })
};

server.genmove = async function(color) {
    // console.log("genmove");
    return fetch(SERVER_URL + "genmove?color=" + colorNumToName(color),
        { method: "GET" })
        .then(response => response.text())
        .then(coord => {
            return coordNameToNum(coord);
        });
};

server.analyze = async function(color, moveOptions = options.moveOptions, strength = options.strength) {
    // console.log("analyze");
    return fetch(SERVER_URL + "analyze?color=" + colorNumToName(color) + "&moveOptions=" + moveOptions + "&strength=" + strength,
        { method: "GET" })
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
    return fetch(SERVER_URL + "play?color=" + colorNumToName(color) + "&coord=" + nameCoord,
        { method: "GET" })
};