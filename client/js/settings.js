var settings = {};


settings.SETTINGS = {
    scoreChartColor: utils.TYPES.INT,

    boardsize: utils.TYPES.INT,
    handicap: utils.TYPES.INT,
    color: utils.TYPES.INT,
    preMovesSwitch: utils.TYPES.BOOL,
    preMoves: utils.TYPES.INT,
    preVisits: utils.TYPES.INT,
    selfplayVisits: utils.TYPES.INT,
    suggestionVisits: utils.TYPES.INT,
    opponentVisits: utils.TYPES.INT,
    disableAICorrection: utils.TYPES.BOOL,

    ruleset: utils.TYPES.STRING,
    komiChangeStyle: utils.TYPES.STRING,
    komi: utils.TYPES.FLOAT,

    preOptions: utils.TYPES.INT,
    preOptionPerc: utils.TYPES.FLOAT,
    cornerSwitch44: utils.TYPES.BOOL,
    cornerSwitch34: utils.TYPES.BOOL,
    cornerSwitch33: utils.TYPES.BOOL,
    cornerSwitch45: utils.TYPES.BOOL,
    cornerSwitch35: utils.TYPES.BOOL,
    cornerChance44: utils.TYPES.INT,
    cornerChance34: utils.TYPES.INT,
    cornerChance33: utils.TYPES.INT,
    cornerChance45: utils.TYPES.INT,
    cornerChance35: utils.TYPES.INT,

    suggestionOptions: utils.TYPES.INT,
    hideWeakerOptions: utils.TYPES.BOOL,
    minVisitsPercSwitch: utils.TYPES.BOOL,
    minVisitsPerc: utils.TYPES.FLOAT,
    maxVisitDiffPercSwitch: utils.TYPES.BOOL,
    maxVisitDiffPerc: utils.TYPES.FLOAT,
    
    opponentOptionsSwitch: utils.TYPES.BOOL,
    opponentOptions: utils.TYPES.INT,
    opponentOptionPerc: utils.TYPES.FLOAT,
    
    skipNextButton: utils.TYPES.BOOL,
};

for (const name of Object.keys(settings.SETTINGS)) {
    settings[name + "Element"] = document.getElementById(name);
}

utils.querySelectorAlls(["input", "select"]).forEach(input => {
    if (input.type != "checkbox") {
        input.required = true;
    }
    if (utils.getSiblingByClass(input, "form-invalid-message") == null) {
        input.insertAdjacentHTML("afterend", "<div class=\"form-invalid-message\"></div>");
    }
});

settings.init = function() {
    for (const name of Object.keys(settings.SETTINGS)) {
        settings.updateSetting(name);
    }
};

settings.updateSetting = function(name) {
    let type = settings.SETTINGS[name];

    let element = settings[name + "Element"];

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

settings.setSetting = function(name, value) {
    settings[name + "Element"].value = value;
    settings[name + "Element"].dispatchEvent(new Event("input"));
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

settings.inputAndSelectInputListener = function(event) {
    let element = event.target;
    if (settings.validateInput(element)) {
        settings.updateSetting(element.id);
    }
};
utils.addEventListeners(utils.querySelectorAlls(["#settings input", "#settings select"]), "input", settings.inputAndSelectInputListener);

settings.suggestionVisitsElementInputListener = function() {
    board.sgf.setRankPlayer();
};
settings.suggestionVisitsElement.addEventListener("input", settings.suggestionVisitsElementInputListener);

settings.opponentVisitsElementInputListener = function() {
    board.sgf.setRankAI();
};
settings.opponentVisitsElement.addEventListener("input", settings.opponentVisitsElementInputListener);

settings.colorElementInputListener = function() {
    board.sgf.setPlayers();
    board.sgf.setRankPlayer();
    board.sgf.setRankAI();
};
settings.colorElement.addEventListener("input", settings.colorElementInputListener);

settings.rulesetElementInputListener = async function() {
    board.sgf.setRuleset();
    await server.setRuleset();
};
settings.rulesetElement.addEventListener("input", settings.rulesetElementInputListener);

settings.handicapElementInputListener = function() {
    board.sgf.setHandicap();
};
settings.handicapElement.addEventListener("input", settings.handicapElementInputListener);

settings.komiElementInputListener = async function() {
    board.sgf.setKomi();
    await server.setKomi();
};
settings.komiElement.addEventListener("input", settings.komiElementInputListener);

settings.skipNextButtonElementInputListener = function() {
    if (settings.skipNextButtonElement.checked) {
        if (!board.nextButton.disabled) {
            board.nextButton.click();
        }
    }
};
settings.skipNextButtonElement.addEventListener("input", settings.skipNextButtonElementInputListener);

settings.komiChangeStyleElementInputListener = function() {
    if (settings.komiChangeStyle == "auto") {
        settings.komiElement.disabled = true;
        settings.setKomi();
    } else {
        settings.komiElement.disabled = false;
    }
};
settings.komiChangeStyleElement.addEventListener("input", settings.komiChangeStyleElementInputListener);

settings.setKomi = function() {
    if (settings.komiChangeStyle != "auto") return;

    let oldKomi = settings.komi;
    let komi;

    if (settings.handicap != 0) {
        komi = 0.5;
    } else {
        if (settings.ruleset == "japanese") {
            switch (settings.boardsize) {
                case 19:
                    komi = 6.5;
                    break;
                case 13:
                    komi = 6.5;
                    break;
                case 9:
                    komi = 6.5;
                    break;
            }
        } else if (settings.ruleset == "chinese") {
            switch (settings.boardsize) {
                case 19:
                    komi = 7.5;
                    break;
                case 13:
                    komi = 6.5;
                    break;
                case 9:
                    komi = 6.5;
                    break;
            }
        }
    }

    if (komi != oldKomi) {
        settings.setSetting("komi", komi);
    }
};
settings.handicapElement.addEventListener("input", settings.setKomi);
settings.rulesetElement.addEventListener("input", settings.setKomi);
settings.boardsizeElement.addEventListener("input", settings.setKomi);

settings.init();