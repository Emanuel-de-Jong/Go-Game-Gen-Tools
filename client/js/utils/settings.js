var settings = {};


settings.SETTINGS = {
    scoreChartColor: utils.TYPE.INT,

    boardsize: utils.TYPE.INT,
    handicap: utils.TYPE.INT,
    color: utils.TYPE.INT,
    preMovesSwitch: utils.TYPE.BOOL,
    preMoves: utils.TYPE.INT,
    preVisits: utils.TYPE.INT,
    selfplayVisits: utils.TYPE.INT,
    suggestionVisits: utils.TYPE.INT,
    opponentVisits: utils.TYPE.INT,
    disableAICorrection: utils.TYPE.BOOL,

    ruleset: utils.TYPE.STRING,
    komiChangeStyle: utils.TYPE.STRING,
    komi: utils.TYPE.FLOAT,

    preOptions: utils.TYPE.INT,
    preOptionPerc: utils.TYPE.FLOAT,
    cornerSwitch44: utils.TYPE.BOOL,
    cornerSwitch34: utils.TYPE.BOOL,
    cornerSwitch33: utils.TYPE.BOOL,
    cornerSwitch45: utils.TYPE.BOOL,
    cornerSwitch35: utils.TYPE.BOOL,
    cornerChance44: utils.TYPE.INT,
    cornerChance34: utils.TYPE.INT,
    cornerChance33: utils.TYPE.INT,
    cornerChance45: utils.TYPE.INT,
    cornerChance35: utils.TYPE.INT,

    suggestionOptions: utils.TYPE.INT,
    hideWeakerOptions: utils.TYPE.BOOL,
    minVisitsPercSwitch: utils.TYPE.BOOL,
    minVisitsPerc: utils.TYPE.FLOAT,
    maxVisitDiffPercSwitch: utils.TYPE.BOOL,
    maxVisitDiffPerc: utils.TYPE.FLOAT,
    
    opponentOptionsSwitch: utils.TYPE.BOOL,
    opponentOptions: utils.TYPE.INT,
    opponentOptionPerc: utils.TYPE.FLOAT,
    
    skipNextButton: utils.TYPE.BOOL,
};


settings.init = function() {
    for (const name of Object.keys(settings.SETTINGS)) {
        settings[name + "Element"] = document.getElementById(name);
    }

    utils.addEventListeners(utils.querySelectorAlls(["#settings input", "#settings select"]), "input", settings.inputAndSelectInputListener);
    settings.handicapElement.addEventListener("input", settings.handicapElementInputListener);
    settings.colorElement.addEventListener("input", settings.colorElementInputListener);
    settings.suggestionVisitsElement.addEventListener("input", settings.suggestionVisitsElementInputListener);
    settings.opponentVisitsElement.addEventListener("input", settings.opponentVisitsElementInputListener);
    settings.rulesetElement.addEventListener("input", settings.rulesetElementInputListener);
    settings.komiChangeStyleElement.addEventListener("input", settings.komiChangeStyleElementInputListener);
    settings.komiElement.addEventListener("input", settings.komiElementInputListener);
    settings.handicapElement.addEventListener("input", settings.setKomi);
    settings.rulesetElement.addEventListener("input", settings.setKomi);
    settings.boardsizeElement.addEventListener("input", settings.setKomi);
    settings.skipNextButtonElement.addEventListener("input", settings.skipNextButtonElementInputListener);

    utils.querySelectorAlls(["input", "select"]).forEach(input => {
        if (input.type != "checkbox") {
            input.required = true;
        }
        if (utils.getSiblingByClass(input, "form-invalid-message") == null) {
            input.insertAdjacentHTML("afterend", "<div class=\"form-invalid-message\"></div>");
        }
    });

    for (const name of Object.keys(settings.SETTINGS)) {
        settings.updateSetting(name);
    }

	settings.clear();
};

settings.clear = function() {

};


settings.updateSetting = function(name) {
    let type = settings.SETTINGS[name];

    let element = settings[name + "Element"];

    let value = type == utils.TYPE.BOOL ? element.checked : element.value;
    if (type == utils.TYPE.INT) {
        value = parseInt(value);
    } else if (type == utils.TYPE.FLOAT) {
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

settings.inputAndSelectInputListener = function(event) {
    let element = event.target;
    if (settings.validateInput(element)) {
        settings.updateSetting(element.id);
    }
};

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

settings.handicapElementInputListener = function() {
    sgf.setHandicap();
};

settings.colorElementInputListener = function() {
    sgf.setPlayers();
    sgf.setRankPlayer();
    sgf.setRankAI();
};

settings.suggestionVisitsElementInputListener = function() {
    sgf.setRankPlayer();
};

settings.opponentVisitsElementInputListener = function() {
    sgf.setRankAI();
};

settings.rulesetElementInputListener = async function() {
    sgf.setRuleset();
    await server.setRuleset();
};

settings.komiChangeStyleElementInputListener = function() {
    if (settings.komiChangeStyle == "auto") {
        settings.komiElement.disabled = true;
        settings.setKomi();
    } else {
        settings.komiElement.disabled = false;
    }
};

settings.komiElementInputListener = async function() {
    sgf.setKomi();
    await server.setKomi();
};

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
        sgf.setKomi();
    }
};

settings.skipNextButtonElementInputListener = function() {
    if (settings.skipNextButtonElement.checked) {
        if (!board.nextButton.disabled) {
            board.nextButton.click();
        }
    }
};