var settings = {};


settings.SETTINGS = {
    boardsize: utils.TYPES.INT,
    color: utils.TYPES.INT,
    ruleset: utils.TYPES.STRING,
    handicap: utils.TYPES.INT,
    komi: utils.TYPES.FLOAT,
    preMoves: utils.TYPES.INT,
    preOptions: utils.TYPES.INT,
    moveOptions: utils.TYPES.INT,
    preStrength: utils.TYPES.INT,
    postStrength: utils.TYPES.INT,
    suggestionStrength: utils.TYPES.INT,
    opponentStrength: utils.TYPES.INT,
    minimumVisits: utils.TYPES.INT,
    disableAICorrection: utils.TYPES.BOOL,
};

settings.update = function() {
    settings.getSettings();
};

settings.getSettings = function() {
    for (const name of Object.keys(settings.SETTINGS)) {
        settings.getSetting(name);
    }
};

settings.getSetting = function(name) {
    let type = settings.SETTINGS[name];

    let element = document.getElementById(name);

    let value = type == utils.TYPES.BOOL ? element.checked : element.value;
    if (type == utils.TYPES.INT) {
        value = parseInt(value);
    } else if (type == utils.TYPES.FLOAT) {
        value = parseFloat(value);
    }

    if (name == "color" && value == 0) {
        value = utils.randomInt(2) == 0 ? -1 : 1;
    }
    
    settings[name] = value;
}

settings.validateInput = function(input) {
    let valid = input.validity.valid;
    if (valid) {
        settings.hideInvalidMessage(input);
    } else {
        settings.showInvalidMessage(input);
    }
    return valid;
};

settings.showInvalidMessage = function(input) {
    input.classList.add("form-invalid");

    let messageDiv = utils.getSiblingByClass(input, "form-invalid-message");
    messageDiv.innerHTML = input.validationMessage;
};

settings.hideInvalidMessage = function(input) {
    input.classList.remove("form-invalid");

    let messageDiv = utils.getSiblingByClass(input, "form-invalid-message");
    messageDiv.innerHTML = "";
};

utils.querySelectorAlls(["input", "select"]).forEach(input => {
    if (input.type != "checkbox") {
        input.required = true;
    }
    input.insertAdjacentHTML("afterend", "<div class=\"form-invalid-message\"></div>");
});

utils.addEventListeners(utils.querySelectorAlls(["#settings input", "#settings select"]), "input", (event) => {
    let element = event.target;
    if (settings.validateInput(element)) {
        settings.getSetting(element.id);
    }
});

settings.update();