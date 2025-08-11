var sgfComment = {};


sgfComment.init = function () {
    sgfComment.clear();
};

sgfComment.clear = function () {
    sgfComment.setComment(G.MOVE_TYPE.INIT);
};


sgfComment.setComment = function (moveType) {
    if (moveType == G.MOVE_TYPE.NONE) return;

    let comment;
    switch (moveType) {
        case G.MOVE_TYPE.INIT:
            comment = sgfComment.createInitComment();
            break;
        case G.MOVE_TYPE.FORCED_CORNER:
            comment = sgfComment.createForcedCornerComment();
            break;
        case G.MOVE_TYPE.PRE:
            comment = sgfComment.createPreComment();
            break;
        case G.MOVE_TYPE.SELFPLAY:
            comment = sgfComment.createSelfplayComment();
            break;
        case G.MOVE_TYPE.PLAYER:
            comment = sgfComment.createPlayerComment();
            break;
        case G.MOVE_TYPE.OPPONENT:
            comment = sgfComment.createOpponentComment();
            break;
    }

    board.editor.setComment(comment);
    board.commentElement.scrollTop = 0;

    G.moveTypeHistory.add(moveType);
};

sgfComment.createInitComment = function () {
    return "GOSUJI " + G.VERSION +
        "\nBoard size: " + board.boardsize +
        "\nHandicap: " + board.handicap +
        "\nColor: " + G.colorNumToFullName(G.color) +
        "\nPre moves switch: " + settings.preMovesSwitch +
        "\nPre moves: " + settings.preMoves +
        "\nPre move strength: " + settings.preVisits +
        "\nSelfplay strength: " + settings.selfplayVisits +
        "\nSuggestion strength: " + settings.suggestionVisits +
        "\nOpponent strength: " + settings.opponentVisits +
        "\nDisable AI correction: " + settings.disableAICorrection +

        "\n\nGame" +
        "\nRuleset: " + sgf.ruleset +
        "\nKomi change style: " + settings.komiChangeStyle +
        "\nKomi: " + sgf.komi +

        "\n\nPre moves" +
        "\nOptions: " + settings.preOptions +
        "\nOption chance: " + settings.preOptionPerc + "%" +
        "\nForce opponent corners: " + settings.forceOpponentCorners +
        "\n4-4 switch: " + settings.cornerSwitch44 +
        "\n4-4 chance: " + settings.cornerChance44 +
        "\n3-4 switch: " + settings.cornerSwitch34 +
        "\n3-4 chance: " + settings.cornerChance34 +
        "\n3-3 switch: " + settings.cornerSwitch33 +
        "\n3-3 chance: " + settings.cornerChance33 +
        "\n4-5 switch: " + settings.cornerSwitch45 +
        "\n4-5 chance: " + settings.cornerChance45 +
        "\n3-5 switch: " + settings.cornerSwitch35 +
        "\n3-5 chance: " + settings.cornerChance35 +

        "\n\nFilters" +
        "\nSuggestion options: " + settings.suggestionOptions +
        "\nShow options: " + settings.showOptions +
        "\nShow weaker options: " + settings.showWeakerOptions +
        "\nMin strength switch: " + settings.minVisitsPercSwitch +
        "\nMin strength: " + settings.minVisitsPerc + "%" +
        "\nMax strength difference switch: " + settings.maxVisitDiffPercSwitch +
        "\nMax strength difference: " + settings.maxVisitDiffPerc +

        "\n\nOpponent" +
        "\nOptions switch: " + settings.opponentOptionsSwitch +
        "\nOptions: " + settings.opponentOptions +
        "\nOption chance: " + settings.opponentOptionPerc + "%" +
        "\nShow options: " + settings.showOpponentOptions +

        "\n" + sgfComment.createCommentKataGo();
};

sgfComment.createForcedCornerComment = function () {
    return "FORCED CORNER MOVE" +
        sgfComment.createCommentScore();
};

sgfComment.createPreComment = function () {
    return "PRE MOVE" +
        sgfComment.createCommentVisits() +
        "\n" + sgfComment.createCommentScore();
};

sgfComment.createSelfplayComment = function () {
    return "SELFPLAY MOVE" +
        sgfComment.createCommentVisits() +
        "\n" + sgfComment.createCommentScore();
};

sgfComment.createPlayerComment = function () {
    return "PLAYER MOVE" +
        sgfComment.createCommentVisits() +
        "\n" + sgfComment.createCommentRatio() +
        "\n" + sgfComment.createCommentScore();
};

sgfComment.createOpponentComment = function () {
    return "OPPONENT MOVE" +
        sgfComment.createCommentVisits() +
        "\n" + sgfComment.createCommentRatio() +
        "\n" + sgfComment.createCommentScore();
};


sgfComment.createCommentVisits = function () {
    let suggestions = G.suggestions;
    if (suggestions == null) return "";

    comment = "\nVisits";
    for (let i = 0; i < suggestions.length(); i++) {
        let suggestion = suggestions.get(i);
        if (i != 0 && suggestion.visits == suggestions.get(i - 1).visits) continue;

        comment += "\n" + suggestion.grade + ": " + suggestion.visits;
    }

    return comment;
};

sgfComment.createCommentRatio = function () {
    let ratio = stats.ratio;
    if (ratio == null) return "";

    return "\nRight" +
        "\nRatio: " + ratio.getRightPercent() + "%" +
        "\nStreak: " + ratio.rightStreak +
        "\nTop streak: " + ratio.rightTopStreak +

        "\n\nPerfect (A)" +
        "\nRatio: " + ratio.getPerfectPercent() + "%" +
        "\nStreak: " + ratio.perfectStreak +
        "\nTop streak: " + ratio.perfectTopStreak;
}

sgfComment.createCommentScore = function () {
    let score = scoreChart.history.get();
    if (score == null) return "";

    return "\nScore " + G.colorNumToName(scoreChart.colorElement.value) +
        "\nWinrate: " + score.formatWinrate() + "%" +
        "\nScore: " + score.formatScoreLead();
};

sgfComment.createCommentKataGo = function () {
    if (G.kataGoVersion == null) return "";

    return "\nKataGo" +
        "\nVersion: " + G.kataGoVersion.version +
        "\nModel: " + G.kataGoVersion.model;
};
