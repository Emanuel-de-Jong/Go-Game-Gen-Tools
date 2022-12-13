var stats = {};


stats.TYPE = {
    WRONG: 0,
    RIGHT: 1,
    PERFECT: 2
}


stats.init = function() {
    stats.rightPercentElement = document.getElementById("rightPercent");
    stats.rightStreakElement = document.getElementById("rightStreak");
    stats.rightTopStreakElement = document.getElementById("rightTopStreak");
    
    stats.perfectPercentElement = document.getElementById("perfectPercent");
    stats.perfectStreakElement = document.getElementById("perfectStreak");
    stats.perfectTopStreakElement = document.getElementById("perfectTopStreak");
    
    stats.visitsElement = document.getElementById("visits");
    
    stats.resultDivElement = document.getElementById("resultDiv");
    stats.resultElement = document.getElementById("result");
    
    stats.clear();
};

stats.clear = function() {
    stats.history = [];
    
    stats.clearRatio();
    stats.clearVisits();
    stats.clearResult();
};


stats.setRatio = function(isRight, isPerfect) {
	let coord = board.getNodeCoord();

    let type = stats.TYPE.WRONG;
    if (isPerfect) {
        type = stats.TYPE.PERFECT;
    } else if (isRight) {
        type = stats.TYPE.RIGHT;
    }

	if (!stats.history[coord.y]) {
		stats.history[coord.y] = [];
	}
	stats.history[coord.y][coord.x] = type;

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

stats.clearRatio = function() {
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
};


stats.setVisits = function(suggestions) {
	let visitsHtml = "";
    for (let i=0; i<suggestions.length(); i++) {
        let suggestion = suggestions.get(i);
        if (i != 0 && suggestion.visits == suggestions.get(i - 1).visits) continue;

		visitsHtml += "<div>" + suggestion.grade + ": " + suggestion.visits + "</div>";
	}
    stats.visitsElement.innerHTML = visitsHtml;
};

stats.clearVisits = function() {
    stats.visitsElement.innerHTML = "";
};


stats.setResult = function(result) {
    stats.resultElement.innerHTML = result;
    stats.resultDivElement.hidden = false;
}

stats.clearResult = function() {
    stats.resultElement.innerHTML = "";
    stats.resultDivElement.hidden = true;
};