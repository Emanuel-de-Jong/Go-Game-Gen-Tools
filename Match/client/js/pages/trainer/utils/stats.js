var stats = {};


stats.RATIO_TYPE = {
    NONE: 0,
    WRONG: 1,
    RIGHT: 2,
    PERFECT: 3,
};

stats.RATIO_Y_INDICATOR = -1;


stats.init = function (serverRatios) {
    stats.rightPercentElement = document.getElementById("rightPercent");
    stats.rightStreakElement = document.getElementById("rightStreak");
    stats.rightTopStreakElement = document.getElementById("rightTopStreak");

    stats.perfectPercentElement = document.getElementById("perfectPercent");
    stats.perfectStreakElement = document.getElementById("perfectStreak");
    stats.perfectTopStreakElement = document.getElementById("perfectTopStreak");

    stats.visitsElement = document.getElementById("visits");

    stats.resultDivElement = document.getElementById("resultDiv");
    stats.resultElement = document.getElementById("result");

    stats.clear(serverRatios);
};

stats.clear = function (serverRatios) {
    stats.ratioHistory = serverRatios ? History.fromServer(serverRatios) : new History();
    stats.ratio = null;

    stats.clearRatio();
    stats.clearVisits();
    stats.clearResult();

    if (debug.testData == 1) {
        stats.ratioHistory.add(stats.RATIO_TYPE.WRONG, 1, 0);
        stats.ratioHistory.add(stats.RATIO_TYPE.RIGHT, 3, 0);
        stats.ratioHistory.add(stats.RATIO_TYPE.PERFECT, 5, 0);

        stats.ratioHistory.add(stats.RATIO_TYPE.RIGHT, 1, 1);
        stats.ratioHistory.add(stats.RATIO_TYPE.PERFECT, 3, 1);
        stats.ratioHistory.add(stats.RATIO_TYPE.WRONG, 5, 1);
        stats.ratioHistory.add(stats.RATIO_TYPE.WRONG, 7, 1);

        stats.ratioHistory.add(stats.RATIO_TYPE.RIGHT, 5, 2);
    } else if (debug.testData == 2) {
        for (let i = utils.randomInt(61, 1); i < utils.randomInt(241, 80); i += 2) {
            stats.ratioHistory.add(utils.randomInt(4, 1), i, 0);
        }
    }
};


stats.updateRatioHistory = function (isRight, isPerfect) {
    let type = stats.RATIO_TYPE.WRONG;
    if (isPerfect) {
        type = stats.RATIO_TYPE.PERFECT;
    } else if (isRight) {
        type = stats.RATIO_TYPE.RIGHT;
    }

    stats.ratioHistory.add(type);
};

stats.encodeRatioHistory = function () {
    let encoded = stats.encodeRatioHistoryLoop();

    let firstY = byteUtils.numToBytes(stats.RATIO_Y_INDICATOR, 2);
    firstY = byteUtils.numToBytes(0, 2, firstY);
    firstY = byteUtils.numToBytes(0, 2, firstY);
    firstY = byteUtils.numToBytes(0, 2, firstY);

    encoded = firstY.concat(encoded);

    // stats.decodeRatioHistory(encoded);

    return encoded;
};

stats.encodeRatioHistoryLoop = function (node = board.editor.getRoot()) {
    let encoded = [];

    for (let i = 0; i < node.children.length; i++) {
        let childNode = node.children[i];

        if (!stats.ratioHistory.hasY(childNode.navTreeY)) continue;

        if (i > 0) {
            let parentNode = node;
            while (parentNode.parent != null) {
                if (stats.ratioHistory.get(parentNode.navTreeX, parentNode.navTreeY)) {
                    break;
                }

                parentNode = parentNode.parent;
            }

            encoded = byteUtils.numToBytes(stats.RATIO_Y_INDICATOR, 2, encoded);
            encoded = byteUtils.numToBytes(childNode.navTreeY, 2, encoded);
            encoded = byteUtils.numToBytes(parentNode.navTreeY, 2, encoded);
            encoded = byteUtils.numToBytes(parentNode.navTreeX, 2, encoded);
        }

        let val = stats.ratioHistory.get(childNode.navTreeX, childNode.navTreeY);
        if (val) {
            encoded = byteUtils.numToBytes(childNode.navTreeX, 2, encoded);
            encoded = byteUtils.numToBytes(val, 1, encoded);
            // console.log(childNode.navTreeY + ", " + childNode.navTreeX + ": " + val);
        }

        encoded = encoded.concat(stats.encodeRatioHistoryLoop(childNode));
    }

    return encoded;
};

stats.decodeRatioHistory = function (encoded) {
    let rootNode = new CNode();

    let i = 0;
    let y = 0;
    let node = rootNode;
    while (i < encoded.length) {
        let x = encoded[i];
        if (x == stats.RATIO_Y_INDICATOR) {
            y = encoded[i + 1];
            node = rootNode.nodes.get(encoded[i + 3], encoded[i + 2]);
            i += 4;
        } else {
            node = node.add(encoded[i + 1], x, y);
            i += 2;
        }
    }

    stats.printDecodedRatioHistory(rootNode);
};

stats.printDecodedRatioHistory = function (node) {
    for (let i = 0; i < node.children.length; i++) {
        let childNode = node.children[i];
        console.log(childNode.y + ", " + childNode.x + ": " + childNode.value);
        stats.printDecodedRatioHistory(childNode);
    }
};

stats.getMostRatiosBranch = function (node = board.editor.getRoot(), ratioCount = 0) {
    if (stats.ratioHistory.get(node.navTreeX, node.navTreeY)) ratioCount++;

    if (node.children.length == 0) {
        return {
            node: node,
            count: ratioCount,
        };
    }

    let childRatioCounts = [];
    for (let i = 0; i < node.children.length; i++) {
        childRatioCounts.push(stats.getMostRatiosBranch(node.children[i], ratioCount));
    }

    childRatioCounts.sort((a, b) => {
        return b.count - a.count;
    });
    return childRatioCounts[0];
};

stats.getRatio = function (rangeStart, rangeEnd = Number.MAX_SAFE_INTEGER) {
    let node;
    if (rangeStart == null) {
        node = board.editor.getCurrent();
    } else {
        node = board.editor.getRoot();
        while (node.children.length != 0 && node.moveNumber < rangeEnd) {
            if (node.children[0].moveNumber > rangeEnd) break;
            node = node.children[0];
        }
    }

    let moveNumber = node.moveNumber;

    let ratios = [];
    while (node && (rangeStart == null || node.moveNumber >= rangeStart)) {
        let x = node.navTreeX;
        let y = node.navTreeY;

        node = node.parent;

        let ratio = stats.ratioHistory.get(x, y);
        if (!ratio) continue;

        ratios.push(ratio);
    }

    // if (ratios.length == 0) {
    //     return;
    // }

    ratios = ratios.reverse();

    let perfect = 0,
        perfectStreak = 0,
        perfectTopStreak = 0;
    let right = 0,
        rightStreak = 0,
        rightTopStreak = 0;

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

    return new Ratio(
        moveNumber,
        ratios.length,

        right,
        rightStreak,
        rightTopStreak,

        perfect,
        perfectStreak,
        perfectTopStreak
    );
};

stats.setRatio = function () {
    stats.ratio = stats.getRatio();

    if (stats.ratio == null) {
        stats.clearRatio();
        return;
    }

    stats.rightPercentElement.innerHTML = stats.ratio.getRightPercent();
    stats.rightStreakElement.innerHTML = stats.ratio.rightStreak;
    stats.rightTopStreakElement.innerHTML = stats.ratio.rightTopStreak;

    stats.perfectPercentElement.innerHTML = stats.ratio.getPerfectPercent();
    stats.perfectStreakElement.innerHTML = stats.ratio.perfectStreak;
    stats.perfectTopStreakElement.innerHTML = stats.ratio.perfectTopStreak;
};

stats.clearRatio = function () {
    stats.rightPercentElement.innerHTML = "-";
    stats.rightStreakElement.innerHTML = 0;
    stats.rightTopStreakElement.innerHTML = 0;

    stats.perfectPercentElement.innerHTML = "-";
    stats.perfectStreakElement.innerHTML = 0;
    stats.perfectTopStreakElement.innerHTML = 0;
};


stats.setVisits = function (suggestionList) {
    let suggestions = suggestionList.getFilterByWeaker();

    let visitsHtml = "";
    for (let i = 0; i < suggestions.length; i++) {
        let suggestion = suggestions[i];
        if (i != 0 && suggestion.visits == suggestions[i - 1].visits) continue;

        visitsHtml += "<div>" + suggestion.grade + ": " + suggestion.visits + "</div>";
    }
    stats.visitsElement.innerHTML = visitsHtml;
};

stats.clearVisits = function () {
    stats.visitsElement.innerHTML = "";
};


stats.setResult = function (result) {
    stats.resultElement.innerHTML = result;
    stats.resultDivElement.hidden = false;
};

stats.clearResult = function () {
    stats.resultElement.innerHTML = "";
    stats.resultDivElement.hidden = true;
};
