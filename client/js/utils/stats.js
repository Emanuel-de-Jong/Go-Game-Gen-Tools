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
    stats.ratioHistory = [];
    
    stats.clearRatio();
    stats.clearVisits();
    stats.clearResult();
};


stats.updateRatio = function(isRight, isPerfect) {
	let coord = board.getNodeCoord();

    let type = stats.TYPE.WRONG;
    if (isPerfect) {
        type = stats.TYPE.PERFECT;
    } else if (isRight) {
        type = stats.TYPE.RIGHT;
    }

	if (!stats.ratioHistory[coord.y]) {
		stats.ratioHistory[coord.y] = [];
	}
	stats.ratioHistory[coord.y][coord.x] = type;
}

stats.setRatio = function() {
    let ratios = [];
    let node = board.editor.getCurrent();
    do {
        let x = node.navTreeX;
        let y = node.navTreeY;

        node = node.parent;

        if (stats.ratioHistory[y] == null) continue;
        if (stats.ratioHistory[y][x] == null) continue;

        ratios.push(stats.ratioHistory[y][x])
    } while (node)

    if (ratios.length == 0) {
        stats.clearRatio();
        return;
    }

    ratios = ratios.reverse();

    let perfect=0, perfectStreak=0, perfectTopStreak=0;
    let right=0, rightStreak=0, rightTopStreak=0;

    ratios.forEach((ratio) => {
        if (ratio == stats.TYPE.PERFECT || ratio == stats.TYPE.RIGHT) {
            right++;
            rightStreak++;
            if (rightTopStreak < rightStreak) rightTopStreak = rightStreak;
        } else {
            rightStreak = 0;
        }

        if (ratio == stats.TYPE.PERFECT) {
            perfect++;
            perfectStreak++;
            if (perfectTopStreak < perfectStreak) perfectTopStreak = perfectStreak;
        } else {
            perfectStreak = 0;
        }
    });

    stats.rightPercentElement.innerHTML = Math.round((right / ratios.length) * 100);
    stats.rightStreakElement.innerHTML = rightStreak;
    stats.rightTopStreakElement.innerHTML = rightTopStreak;

    stats.perfectPercentElement.innerHTML = Math.round((perfect / ratios.length) * 100);
    stats.perfectStreakElement.innerHTML = perfectStreak;
    stats.perfectTopStreakElement.innerHTML = perfectTopStreak;
};

stats.clearRatio = function() {
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