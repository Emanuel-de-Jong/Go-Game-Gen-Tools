var options = {}

options.percentElement = document.querySelector("#percent");
options.streakElement = document.querySelector("#streak");
options.topStreakElement = document.querySelector("#topStreak");

options.update = function() {
    options.correct = 0;
    options.wrong = 0;
    options.streak = 0;
    options.topStreak = 0;

    options.percentElement.innerHTML = "-";
    options.streakElement.innerHTML = 0;
    options.topStreakElement.innerHTML = 0;

    options.boardsize = parseInt(document.querySelector("#boardsize").value);
    options.color = parseInt(document.querySelector("#color").value);
    options.ruleset = document.querySelector("#ruleset").value;
    options.handicap = parseInt(document.querySelector("#handicap").value);
    options.komi = parseInt(document.querySelector("#komi").value);
    options.botColor = options.color * -1;
    options.preMoves = parseInt(document.querySelector("#preMoves").value);
    options.moveOptions = parseInt(document.querySelector("#moveOptions").value);
    options.preStrength = parseInt(document.querySelector("#preStrength").value);
    options.strength = parseInt(document.querySelector("#strength").value);
};

options.updateStats = function(isCorrectChoice) {
    if (isCorrectChoice) {
        options.correct += 1;
        options.streak += 1;
        if (options.streak > options.topStreak) {
            options.topStreak = options.streak;
        }
    } else {
        options.wrong += 1;
        options.streak = 0;
    }

    options.percentElement.innerHTML = Math.round((options.correct / (options.correct + options.wrong)) * 100);
    options.streakElement.innerHTML = options.streak;
    options.topStreakElement.innerHTML = options.topStreak;
}

options.update();