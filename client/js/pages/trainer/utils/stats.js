var stats = {};


stats.RATIO_TYPE = {
    NONE: 0,
    WRONG: 1,
    RIGHT: 2,
    PERFECT: 3,
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
    stats.ratio = null;
    
    stats.clearRatio();
    stats.clearVisits();
    stats.clearResult();
};


stats.updateRatioHistory = function(isRight, isPerfect) {
	let coord = board.getNodeCoord();

    let type = stats.RATIO_TYPE.WRONG;
    if (isPerfect) {
        type = stats.RATIO_TYPE.PERFECT;
    } else if (isRight) {
        type = stats.RATIO_TYPE.RIGHT;
    }

	if (!stats.ratioHistory[coord.y]) {
		stats.ratioHistory[coord.y] = [];
	}
	stats.ratioHistory[coord.y][coord.x] = type;
}

stats.normalizeRatioHistory = function() {
    for (let y=0; y<stats.ratioHistory.length; y++) {
        if (!stats.ratioHistory[y]) stats.ratioHistory[y] = [];
        
        for (let x=0; x<stats.ratioHistory[y].length; x++) {
            if (stats.ratioHistory[y][x] == null) stats.ratioHistory[y][x] = stats.RATIO_TYPE.NONE;
        }
    }
};

stats.updateRatio = function() {
    let ratios = [];

    let node = board.editor.getCurrent();
    do {
        let x = node.navTreeX;
        let y = node.navTreeY;

        node = node.parent;

        if (!stats.ratioHistory[y] || stats.ratioHistory[y].length == 0) continue;
        if (!stats.ratioHistory[y][x]) continue;

        ratios.push(stats.ratioHistory[y][x])
    } while (node)

    if (ratios.length == 0) {
        return;
    }

    ratios = ratios.reverse();

    let perfect=0, perfectStreak=0, perfectTopStreak=0;
    let right=0, rightStreak=0, rightTopStreak=0;

    ratios.forEach((ratio) => {
        if (ratio == stats.RATIO_TYPE.PERFECT || ratio == stats.RATIO_TYPE.RIGHT) {
            right++;
            rightStreak++;
            if (rightTopStreak < rightStreak) rightTopStreak = rightStreak;
        } else {
            rightStreak = 0;
        }

        if (ratio == stats.RATIO_TYPE.PERFECT) {
            perfect++;
            perfectStreak++;
            if (perfectTopStreak < perfectStreak) perfectTopStreak = perfectStreak;
        } else {
            perfectStreak = 0;
        }
    });

    stats.ratio = new Ratio(
        null,
        ratios.length,

        right,
        Math.round((right / ratios.length) * 100),
        rightStreak,
        rightTopStreak,

        perfect,
        Math.round((perfect / ratios.length) * 100),
        perfectStreak,
        perfectTopStreak
    );
}

stats.setRatio = function() {
    this.updateRatio();

    if (stats.ratio == null) {
        stats.clearRatio();
        return;
    }

    stats.rightPercentElement.innerHTML = stats.ratio.rightPercent;
    stats.rightStreakElement.innerHTML = stats.ratio.rightStreak;
    stats.rightTopStreakElement.innerHTML = stats.ratio.rightTopStreak;

    stats.perfectPercentElement.innerHTML = stats.ratio.perfectPercent;
    stats.perfectStreakElement.innerHTML = stats.ratio.perfectStreak;
    stats.perfectTopStreakElement.innerHTML = stats.ratio.perfectTopStreak;
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