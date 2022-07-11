
let SERVER_URL = "http://localhost:8080/kata/";

var game = new tenuki.Game({ element: document.querySelector(".tenuki-board") });

function tenukiToKata(x, y) {
	let xConvert = {
		0: "A",
		1: "B",
		2: "C",
		3: "D",
		4: "E",
		5: "F",
		6: "G",
		7: "H",
		8: "J",
		9: "K",
		10: "L",
		11: "M",
		12: "N",
		13: "O",
		14: "P",
		15: "Q",
		16: "R",
		17: "S",
		18: "T"
	};
	let yConvert = {
		0: 19,
		1: 18,
		2: 17,
		3: 16,
		4: 15,
		5: 14,
		6: 13,
		7: 12,
		8: 11,
		9: 10,
		10: 9,
		11: 8,
		12: 7,
		13: 6,
		14: 5,
		15: 4,
		16: 3,
		17: 2,
		18: 1
	};

	let coord = "" + xConvert[x] + yConvert[y];
	console.log("tenukiToKata " + x + ", " + y + " = " + coord);
	return coord;
}

function kataToTenuki(coord) {
	let xConvert = {
		"A": 0,
		"B": 1,
		"C": 2,
		"D": 3,
		"E": 4,
		"F": 5,
		"G": 6,
		"H": 7,
		"J": 8,
		"K": 9,
		"L": 10,
		"M": 11,
		"N": 12,
		"O": 13,
		"P": 14,
		"Q": 15,
		"R": 16,
		"S": 17,
		"T": 18
	};
	let yConvert = {
		19: 0,
		18: 1,
		17: 2,
		16: 3,
		15: 4,
		14: 5,
		13: 6,
		12: 7,
		11: 8,
		10: 9,
		9: 10,
		8: 11,
		7: 12,
		6: 13,
		5: 14,
		4: 15,
		3: 16,
		2: 17,
		1: 18
	};

	let x = xConvert[coord[0]];
	let y = yConvert[parseInt(coord.substring(1))];
	console.log("kataToTenuki " + coord + " = " + x + ", " + y);
	return { "x": x, "y": y };
}

async function genmove(color) {
	console.log("genmove " + SERVER_URL + "genmove?color=" + color);
	return fetch(SERVER_URL + "genmove?color=" + color,
		{ method: "GET" })
		.then(response => response.text())
		.then(data => {
			return kataToTenuki(data);
			// let coord = kataToTenuki(data);
			// console.log("game.playAt(" + coord[0] + ", " + coord[1] + ");");
			// game.playAt(coord[0], coord[1]);
		});
}

async function play(x, y, color) {
	let coord = tenukiToKata(x, y);
	console.log("play " + SERVER_URL + "play?color=" + color + "&coord=" + coord);
	return fetch(SERVER_URL + "play?color=" + color + "&coord=" + coord,
		{ method: "GET" })
}

async function turn(x, y) {
	await play(x, y, black);
	let coord = await genmove(white);
	console.log("game.playAt(" + coord["y"] + ", " + coord["x"] + ");");
	game.playAt(coord["y"], coord["x"]);
}

game.callbacks.postRender = function (game) {
	if (game.currentState().pass) {}

	if (game.currentState().playedPoint) {
		console.log(game.currentState().color + " played " + game.currentState().playedPoint.x + ", " + game.currentState().playedPoint.y);
		if (game.currentState().color == "black") {
			turn(game.currentState().playedPoint.x, game.currentState().playedPoint.y);
		}
	}
};