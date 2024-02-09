var settings = {};


settings.init = function() {
    settings.preVisits = 3000;
    settings.preMoves = 60;
    settings.cornerChance44 = 40;
    settings.cornerChance34 = 30;
    settings.cornerChance33 = 15;
    settings.cornerChance45 = 5;
    settings.cornerChance35 = 5;

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
    if (settings.preOptionsCount < 2) {
        settings.preOptions = preMovePlacer.PRE_OPTIONS;
        settings.preOptionsCount++;
    } else {
        settings.preOptions = 1;
        settings.preOptionsCount = 0;
    }

    settings.color = utils.randomInt(2) == 0 ? -1 : 1;

    // settings.onlyCommonCorners = utils.randomInt(5) == 0 ? true : false;
    settings.onlyCommonCorners = false;
};