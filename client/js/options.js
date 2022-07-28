var options = {}

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

    options.boardsize = parseInt(document.getElementById("boardsize").value);
    options.color = parseInt(document.getElementById("color").value);
    options.ruleset = document.getElementById("ruleset").value;
    options.handicap = parseInt(document.getElementById("handicap").value);
    options.komi = parseFloat(document.getElementById("komi").value);
    options.preMoves = parseInt(document.getElementById("preMoves").value);
    options.moveOptions = parseInt(document.getElementById("moveOptions").value);
    options.preStrength = parseInt(document.getElementById("preStrength").value);
    options.postStrength = parseInt(document.getElementById("postStrength").value);
    options.suggestionStrength = parseInt(document.getElementById("suggestionStrength").value);
    options.opponentStrength = parseInt(document.getElementById("opponentStrength").value);
};

options.updateStats = function(isRight, isPerfect) {
    options.total += 1;

    if (isRight) {
        options.rightCorrect += 1;
        options.rightStreak += 1;
        if (options.rightStreak > options.rightTopStreak) {
            options.rightTopStreak = options.rightStreak;
        }
    } else {
        options.rightStreak = 0;
    }

    if (isPerfect) {
        options.perfectCorrect += 1;
        options.perfectStreak += 1;
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
    if (input.validity.valid) {
        options.hideInvalidMessage(input);
    } else {
        options.showInvalidMessage(input);
    }
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

utils.querySelectorAlls(["input"]).forEach(input => {
    input.required = true;
    input.insertAdjacentHTML("afterend", "<div class=\"form-invalid-message\"></div>");
});

utils.addEventListeners(utils.querySelectorAlls(["#settings input"]), "input", (event) => {
    options.validateInput(event.target);
});

options.update();