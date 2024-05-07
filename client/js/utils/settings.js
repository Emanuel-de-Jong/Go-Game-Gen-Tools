var settings = {};


settings.init = function() {
    settings.preVisits = 5_000;
    settings.preMoves = 80;
    settings.onlyCommonCornersPerc = 50;
    settings.cornerChance44 = 2;
    settings.cornerChance34 = 2;
    settings.cornerChance33 = 1;
    settings.cornerChance45 = 1;
    settings.cornerChance35 = 1;

    settings.boardsize = 19;
    settings.ruleset = "Japanese";
    settings.komi = 6.5
    settings.suggestionOptions = 4;
    settings.minVisitsPercSwitch = true;
    settings.minVisitsPerc = 10
    settings.maxVisitDiffPercSwitch = false;
    settings.maxVisitDiffPerc = 40;

    settings.preOptionsCount = utils.randomInt(3);

    settings.clear();
};

settings.clear = function() {
    let rnd = utils.randomInt(3);
    switch (rnd) {
        case rnd == 0:
            settings.preVisits = 5_000;
            break;
        case rnd == 1:
            settings.preVisits = 10_000;
            break;
        case rnd == 2:
            settings.preVisits = 15_000;
            break;
    }
    settings.onlyCommonCorners = utils.randomInt(100) < settings.onlyCommonCornersPerc ? true : false;

    if (settings.preOptionsCount < 2) {
        settings.preOptions = preMovePlacer.PRE_OPTIONS;
        settings.preOptionsCount++;
    } else {
        settings.preOptions = 1;
        settings.preOptionsCount = 0;
    }

    settings.color = utils.randomInt(2) == 0 ? -1 : 1;
};