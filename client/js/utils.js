var utils = {};

// 0 to (max-1)
utils.randomInt = function(max) {
	return Math.floor(Math.random() * max);
};

utils.compCoord = function(coord1, coord2) {
	if (coord1.x == coord2.x && coord1.y == coord2.y) {
		return true;
	}
	return false;
};

utils.shuffleArray = function(array) {
    let currentIndex = array.length;
    let randomIndex;
  
    while (currentIndex != 0) {
      randomIndex = utils.randomInt(currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
  
    return array;
};

utils.addEventsListener = function(element, events, fn) {
    events.forEach(event => element.addEventListener(event, fn));
};

utils.addEventListeners = function(elements, event, fn) {
    elements.forEach(element => element.addEventListener(event, fn));
};

utils.addEventsListeners = function(elements, events, fn) {
    events.forEach(event => {
        elements.forEach(element => {
            element.addEventListener(event, fn)
        });
    });
};

utils.querySelectorAlls = function(selectors) {
    let elementArrays = [];
    selectors.forEach(selector => elementArrays.push(Array.from(document.querySelectorAll(selector))));
    return elementArrays.flat();
};

utils.getSiblingByClass = function(element, className) {
    let sibling = element.parentNode.firstElementChild;

    while (sibling) {
        if (sibling.classList.contains(className))
            return sibling;
        
        sibling = sibling.nextElementSibling
    }
};