var stats = {};

stats.scoreChartElement = document.getElementById("scoreChart");

stats.rightPercentElement = document.getElementById("rightPercent");
stats.rightStreakElement = document.getElementById("rightStreak");
stats.rightTopStreakElement = document.getElementById("rightTopStreak");

stats.perfectPercentElement = document.getElementById("perfectPercent");
stats.perfectStreakElement = document.getElementById("perfectStreak");
stats.perfectTopStreakElement = document.getElementById("perfectTopStreak");

stats.visitsElement = document.getElementById("visits");

stats.resultDivElement = document.getElementById("resultDiv");
stats.resultElement = document.getElementById("result");

stats.scoreChart = new ScoreChart(stats.scoreChartElement);

stats.init = function() {
    stats.scoreChart.clear();

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

    stats.resultElement.innerHTML = "";
    stats.resultDivElement.hidden = true;
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
        if (i != 0 && suggestions[i].visits == suggestions[i - 1].visits) continue;

		visitsHtml += "<div>" + suggestions[i].grade + ": " + suggestions[i].visits + "</div>";
	}
    stats.visitsElement.innerHTML = visitsHtml;
};

stats.updateResult = function(suggestion) {
    let result;
    if (suggestion.scoreLead >= 0) {
        result = utils.colorNumToName(suggestion.color) + "+" + suggestion.scoreLead;
    } else {
        result = utils.colorNumToName(suggestion.color * -1) + "+" + (suggestion.scoreLead * -1);
    }

    stats.setResult(result);

    return result;
}

stats.setResult = function(result) {
    stats.resultDivElement.hidden = false;
    stats.resultElement.innerHTML = result;
}