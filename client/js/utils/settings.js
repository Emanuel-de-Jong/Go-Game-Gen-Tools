var settings = {};


settings.init = function() {
    settings.preVisits = 3000;
    settings.preMoves = 6;
    settings.cornerChance44 = 40;
    settings.cornerChance34 = 30;
    settings.cornerChance33 = 15;
    settings.cornerChance45 = 5;
    settings.cornerChance35 = 5;

    settings.boardsize = 9;
    settings.ruleset = "japanese";
    settings.komi = 6.5
    settings.suggestionOptions = 4;
    settings.minVisitsPercSwitch = true;
    settings.minVisitsPerc = 10
    settings.maxVisitDiffPercSwitch = false;
    settings.maxVisitDiffPerc = 40;

    settings.preOptions = 1;

    settings.clear();
};

settings.clear = function() {
    settings.useHandicap = utils.randomInt(2) == 0 ? true : false;

    if (settings.useHandicap) {
        settings.handicap = utils.randomInt(3) + 2;
        settings.komi = 0.5;
    } else {
        settings.handicap = 0;
        settings.komi = 6.5;
    }

    settings.color = utils.randomInt(2) == 0 ? -1 : 1;

    // settings.onlyCommonCorners = utils.randomInt(5) == 0 ? true : false;
    settings.onlyCommonCorners = false;
};