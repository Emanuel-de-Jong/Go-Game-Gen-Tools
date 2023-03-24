var utils = {};


utils.TYPE = {
    NONE: 0,
    INT: 1,
    FLOAT: 2,
    BOOL: 3,
    STRING: 4,
};


// min to (max-1)
utils.randomInt = function (max, min = 0) {
    return Math.floor(Math.random() * (max - min)) + min;
};

utils.randomColor = function () {
    return [utils.randomInt(256), utils.randomInt(256), utils.randomInt(256), utils.randomInt(10) / 10.0];
};

utils.randomColorStr = function (hasAlpha = false) {
    let color = utils.randomColor();
    return "rgb" + (hasAlpha ? "a" : "") +
        "(" + color[0] + ", " + color[1] + ", " + color[2] + (hasAlpha ? ", " + color[3] : "") + ")";
};

utils.shuffleArray = function (array) {
    let currentIndex = array.length;
    let randomIndex;

    while (currentIndex != 0) {
        randomIndex = utils.randomInt(currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
};

utils.addEventsListener = function (element, events, fn) {
    events.forEach((event) => element.addEventListener(event, fn));
};

utils.addEventListeners = function (elements, event, fn) {
    elements.forEach((element) => element.addEventListener(event, fn));
};

utils.addEventsListeners = function (elements, events, fn) {
    events.forEach((event) => {
        elements.forEach((element) => {
            element.addEventListener(event, fn);
        });
    });
};

utils.querySelectorAlls = function (selectors) {
    let elementArrays = [];
    selectors.forEach((selector) => elementArrays.push(Array.from(document.querySelectorAll(selector))));
    return elementArrays.flat();
};

utils.getSiblingByClass = function (element, className) {
    let sibling = element.parentNode.firstElementChild;

    while (sibling) {
        if (sibling.classList.contains(className)) return sibling;

        sibling = sibling.nextElementSibling;
    }
};
