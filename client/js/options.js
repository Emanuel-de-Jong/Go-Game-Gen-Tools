var options = {}

options.rightPercentElement = document.querySelector("#rightPercent");
options.rightStreakElement = document.querySelector("#rightStreak");
options.rightTopStreakElement = document.querySelector("#rightTopStreak");

options.perfectPercentElement = document.querySelector("#perfectPercent");
options.perfectStreakElement = document.querySelector("#perfectStreak");
options.perfectTopStreakElement = document.querySelector("#perfectTopStreak");

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

    options.boardsize = parseInt(document.querySelector("#boardsize").value);
    options.color = parseInt(document.querySelector("#color").value);
    options.ruleset = document.querySelector("#ruleset").value;
    options.handicap = parseInt(document.querySelector("#handicap").value);
    options.komi = parseInt(document.querySelector("#komi").value);
    options.preMoves = parseInt(document.querySelector("#preMoves").value);
    options.moveOptions = parseInt(document.querySelector("#moveOptions").value);
    options.preStrength = parseInt(document.querySelector("#preStrength").value);
    options.postStrength = parseInt(document.querySelector("#postStrength").value);
    options.suggestionStrength = parseInt(document.querySelector("#suggestionStrength").value);
    options.opponentStrength = parseInt(document.querySelector("#opponentStrength").value);
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

function validateInput(input) {
    if (input.validity.valid) {
        hideInvalidMessage(input);
    } else {
        showInvalidMessage(input);
    }
}

function showInvalidMessage(input) {
    input.classList.add("form-invalid");

    let messageDiv = utils.getSiblingByClass(input, "form-invalid-message");
    messageDiv.innerHTML = input.validationMessage;
}

function hideInvalidMessage(input) {
    input.classList.remove("form-invalid");

    let messageDiv = utils.getSiblingByClass(input, "form-invalid-message");
    messageDiv.innerHTML = "";
}

utils.querySelectorAlls(["input"]).forEach(input => {
    input.required = true;
    input.insertAdjacentHTML("afterend", "<div class=\"form-invalid-message\"></div>");
});


utils.addEventListeners(utils.querySelectorAlls(["input"]), "input", (event) => {
    validateInput(event.target);
});

options.update();