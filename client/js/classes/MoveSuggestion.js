class MoveSuggestion {
    
    color;
    coord;
    visits;
    winrate;
    scoreLead;
    grade;


    constructor(serverSuggestion, color, coord, visits, winrate, scoreLead) {
        if (!serverSuggestion) {
            this.color = color;
            this.coord = coord;
            this.visits = visits;
            this.winrate = winrate;
            this.scoreLead = scoreLead;
        } else {
            this.fillWithServerSuggestion(serverSuggestion);
        }
    }

    
    fillWithServerSuggestion(serverSuggestion) {
        this.color = G.colorNameToNum(serverSuggestion.move.color);
        this.coord = katago.coordNameToNum(serverSuggestion.move.coord);
        this.visits = serverSuggestion.visits;
        this.winrate = serverSuggestion.winrate;
        this.scoreLead = serverSuggestion.scoreLead;
    }

    isPass() {
        return this.coord == "pass";
    }

}