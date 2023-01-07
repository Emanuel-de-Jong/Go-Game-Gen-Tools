class MoveSuggestion {
    
    color;
    coord;
    visits;
    score;
    grade;


    constructor(serverSuggestion, color, coord, visits, winrate, scoreLead) {
        if (!serverSuggestion) {
            this.color = color;
            this.coord = coord;
            this.visits = visits;
            this.score = new Score(winrate, scoreLead);
        } else {
            this.fillWithServerSuggestion(serverSuggestion);
        }
    }

    
    fillWithServerSuggestion(serverSuggestion) {
        this.color = G.colorNameToNum(serverSuggestion.move.color);
        this.coord = katago.coordNameToNum(serverSuggestion.move.coord);
        this.visits = serverSuggestion.visits;
        this.score = new Score(serverSuggestion.winrate, serverSuggestion.scoreLead);
    }

    isPass() {
        return this.coord == "pass";
    }

}