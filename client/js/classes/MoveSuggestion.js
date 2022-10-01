class MoveSuggestion {
    
    coord;
    visits;
    winrate;
    scoreLead;
    scoreStdev;

    constructor(coord, visits, winrate, scoreLead, scoreStdev) {
        this.coord = coord;
        this.visits = visits;
        this.winrate = winrate;
        this.scoreLead = scoreLead;
        this.scoreStdev = scoreStdev;
    }

}