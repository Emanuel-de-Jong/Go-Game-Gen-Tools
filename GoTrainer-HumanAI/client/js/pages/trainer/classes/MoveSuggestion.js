class MoveSuggestion {
    coord;
    visits;
    score;
    grade;


    constructor(coord, visits, winrate, scoreLead) {
        this.coord = coord;
        this.visits = visits;
        this.score = new Score(winrate, scoreLead);
    }


    isPass() {
        return this.coord.x == 0;
    }

    encode() {
        let encoded = [];
        encoded = encoded.concat(this.coord.encode());
        encoded = byteUtils.numToBytes(this.visits, 4, encoded);
        encoded = encoded.concat(this.score.encode());
        return encoded;
    }


    static fromKataGo(kataGoSuggestion) {
        return new MoveSuggestion(
            katago.coordNameToNum(kataGoSuggestion.move.coord),
            kataGoSuggestion.visits,
            kataGoSuggestion.winrate,
            kataGoSuggestion.scoreLead
        );
    }

    static fromServer(serverSuggestion) {
        return new MoveSuggestion(
            Coord.fromServer(serverSuggestion.coord),
            serverSuggestion.visits,
            serverSuggestion.score.winrate,
            serverSuggestion.score.scoreLead
        );
    }
}
