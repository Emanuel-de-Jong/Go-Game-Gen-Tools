var utils = {};

utils.randomInt = function(max) {
	return Math.floor(Math.random() * max);
};

utils.compCoord = function(coord1, coord2) {
	if (coord1.x == coord2.x && coord1.y == coord2.y) {
		return true;
	}
	return false;
};