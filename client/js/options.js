var options = {}


options.SETTINGS = {
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

options.rightPercentElement = document.getElementById("rightPercent");
options.rightStreakElement = document.getElementById("rightStreak");
options.rightTopStreakElement = document.getElementById("rightTopStreak");

options.perfectPercentElement = document.getElementById("perfectPercent");
options.perfectStreakElement = document.getElementById("perfectStreak");
options.perfectTopStreakElement = document.getElementById("perfectTopStreak");

options.update = function() {
    options.total = 0;

    options.rightCorrect = 0;
    options.rightStreak = 0;
    options.rightTopStreak = 0;

    options.perfectCorrect = 0;
    options.perfectStreak = 0;
    options.perfectTopStreak = 0;

    options.rightPercentElement.innerHTML = "-";
    options.rightStreakElement.innerHTML = 0;
    options.rightTopStreakElement.innerHTML = 0;

    options.perfectPercentElement.innerHTML = "-";
    options.perfectStreakElement.innerHTML = 0;
    options.perfectTopStreakElement.innerHTML = 0;

    options.getSettings();
};

options.getSettings = function() {
    for (const name of Object.keys(options.SETTINGS)) {
        options.getSetting(name);
    }
};

options.getSetting = function(name) {
    let type = options.SETTINGS[name];

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
    
    options[name] = value;
}

options.updateStats = function(isRight, isPerfect) {
    options.total++;

    if (isRight) {
        options.rightCorrect++;
        options.rightStreak++;
        if (options.rightStreak > options.rightTopStreak) {
            options.rightTopStreak = options.rightStreak;
        }
    } else {
        options.rightStreak = 0;
    }

    if (isPerfect) {
        options.perfectCorrect++;
        options.perfectStreak++;
        if (options.perfectStreak > options.perfectTopStreak) {
            options.perfectTopStreak = options.perfectStreak;
        }
    } else {
        options.perfectStreak = 0;
    }

    options.rightPercentElement.innerHTML = Math.round((options.rightCorrect / options.total) * 100);
    options.rightStreakElement.innerHTML = options.rightStreak;
    options.rightTopStreakElement.innerHTML = options.rightTopStreak;

    options.perfectPercentElement.innerHTML = Math.round((options.perfectCorrect / options.total) * 100);
    options.perfectStreakElement.innerHTML = options.perfectStreak;
    options.perfectTopStreakElement.innerHTML = options.perfectTopStreak;
};

options.validateInput = function(input) {
    let valid = input.validity.valid;
    if (valid) {
        options.hideInvalidMessage(input);
    } else {
        options.showInvalidMessage(input);
    }
    return valid;
};

options.showInvalidMessage = function(input) {
    input.classList.add("form-invalid");

    let messageDiv = utils.getSiblingByClass(input, "form-invalid-message");
    messageDiv.innerHTML = input.validationMessage;
};

options.hideInvalidMessage = function(input) {
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
    if (options.validateInput(element)) {
        options.getSetting(element.id);
    }
});

options.update();