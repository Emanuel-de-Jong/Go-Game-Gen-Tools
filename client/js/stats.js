var stats = {};


stats.winrateElement = document.getElementById("winrate");
stats.pointsElement = document.getElementById("points");

stats.rightPercentElement = document.getElementById("rightPercent");
stats.rightStreakElement = document.getElementById("rightStreak");
stats.rightTopStreakElement = document.getElementById("rightTopStreak");

stats.perfectPercentElement = document.getElementById("perfectPercent");
stats.perfectStreakElement = document.getElementById("perfectStreak");
stats.perfectTopStreakElement = document.getElementById("perfectTopStreak");

stats.visitsElement = document.getElementById("visits");

stats.init = function() {
    stats.winrateElement.innerHTML = "-";
    stats.pointsElement.innerHTML = "-";

    stats.total = 0;

    stats.rightCorrect = 0;
    stats.rightStreak = 0;
    stats.rightTopStreak = 0;

    stats.perfectCorrect = 0;
    stats.perfectStreak = 0;
    stats.perfectTopStreak = 0;

    stats.rightPercentElement.innerHTML = "-";
    stats.rightStreakElement.innerHTML = 0;
    stats.rightTopStreakElement.innerHTML = 0;

    stats.perfectPercentElement.innerHTML = "-";
    stats.perfectStreakElement.innerHTML = 0;
    stats.perfectTopStreakElement.innerHTML = 0;
    
    stats.visitsElement.innerHTML = "";
};

stats.setScore = function(winrate, points) {
    stats.winrateElement.innerHTML = winrate.toFixed(2);
    stats.pointsElement.innerHTML = points.toFixed(1);
};

stats.updateRatio = function(isRight, isPerfect) {
    stats.total++;

    if (isRight) {
        stats.rightCorrect++;
        stats.rightStreak++;
        if (stats.rightStreak > stats.rightTopStreak) {
            stats.rightTopStreak = stats.rightStreak;
        }
    } else {
        stats.rightStreak = 0;
    }

    if (isPerfect) {
        stats.perfectCorrect++;
        stats.perfectStreak++;
        if (stats.perfectStreak > stats.perfectTopStreak) {
            stats.perfectTopStreak = stats.perfectStreak;
        }
    } else {
        stats.perfectStreak = 0;
    }

    stats.rightPercentElement.innerHTML = Math.round((stats.rightCorrect / stats.total) * 100);
    stats.rightStreakElement.innerHTML = stats.rightStreak;
    stats.rightTopStreakElement.innerHTML = stats.rightTopStreak;

    stats.perfectPercentElement.innerHTML = Math.round((stats.perfectCorrect / stats.total) * 100);
    stats.perfectStreakElement.innerHTML = stats.perfectStreak;
    stats.perfectTopStreakElement.innerHTML = stats.perfectTopStreak;
};

stats.setVisits = function(suggestions) {
	let visitsHtml = "";
    for (let i=0; i<suggestions.length; i++) {
		visitsHtml += "<div>" + String.fromCharCode(i + 65) + ": " + suggestions[i].visits + "</div>";
	}
    stats.visitsElement.innerHTML = visitsHtml;
};