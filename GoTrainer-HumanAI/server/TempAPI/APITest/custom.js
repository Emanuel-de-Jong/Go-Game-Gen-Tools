var server = {}


server.URL = "https://localhost:5001/kata/";


server.init = async function() {
    await server.restart();
    await server.setBoardsize(19);
    await server.setRuleset("Japanese");
    await server.setKomi(6.5);
    await server.analyzeMove("B", "D5");
    await server.analyze("B", 25, 10, 100);
    await server.play("B", "D5");
    await server.setBoard([
        {color: "B", coord: "R3"},
        {color: "W", coord: "D3"},
    ]);
    await server.sgf();
}


server.restart = async function() {
    console.log("restart");

    return server.sendRequest(fetch(server.URL + "restart", {
        method: "GET" })
        .then(response => {
            return response;
        })
        .catch(error => {
            return error;
        }));
};

server.setBoardsize = async function(boardsize) {
    console.log("setBoardsize " + boardsize);

    return server.sendRequest(fetch(server.URL + "setboardsize?boardsize=" + boardsize, {
        method: "GET" })
        .then(response => {
            return response;
        })
        .catch(error => {
            return error;
        }));
};

server.setRuleset = async function(ruleset) {
    console.log("setRuleset " + ruleset);

    return server.sendRequest(fetch(server.URL + "setruleset?ruleset=" + ruleset, {
        method: "GET" })
        .then(response => {
            return response;
        })
        .catch(error => {
            return error;
        }));
};

server.setKomi = async function(komi) {
    console.log("setKomi " + komi);

    return server.sendRequest(fetch(server.URL + "setkomi?komi=" + komi, {
        method: "GET" })
        .then(response => {
            return response;
        })
        .catch(error => {
            return error;
        }));
};

server.analyzeMove = async function(color, coord) {
    console.log("analyzeMove " + color + " " + coord);

    return server.sendRequest(fetch(server.URL + "analyzemove?color=" + color +
            "&coord=" + coord, {
        method: "POST" })
        .then(response => response.json())
        .then(suggestion => {
            return JSON.stringify(suggestion);
        })
        .catch(error => {
            return error;
        }));
};

server.analyze = async function(color, maxVisits, minVisitsPerc, maxVisitDiffPerc) {
    console.log("analyze " + color + " " + maxVisits + " " + minVisitsPerc + " " + maxVisitDiffPerc);

    return await server.sendRequest(fetch(server.URL + "analyze?color=" + color +
            "&maxVisits=" + maxVisits +
            "&minVisitsPerc=" + minVisitsPerc +
            "&maxVisitDiffPerc=" + maxVisitDiffPerc, {
        method: "POST" })
        .then(response => response.json())
        .then(suggestions => {
            return JSON.stringify(suggestions);
        })
        .catch(error => {
            return error;
        }));
};

server.play = async function(color, coord) {
    console.log("play " + color + " " + coord);

    return server.sendRequest(fetch(server.URL + "play?color=" + color +
            "&coord=" + coord, {
        method: "GET" })
        .then(response => {
            return response;
        })
        .catch(error => {
            return error;
        }));
};

server.setBoard = async function(moves) {
    console.log("setBoard " + JSON.stringify(moves));

    return server.sendRequest(fetch(server.URL + "setboard", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: '{"moves":' + JSON.stringify(moves) + "}" })
        .then(response => {
            return response;
        })
        .catch(error => {
            return error;
        }));
};

server.sgf = async function() {
    console.log("sgf");

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
    console.log(response);
    // after
    return response;
};


(function () {

	server.init();

})();