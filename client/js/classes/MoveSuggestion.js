class MoveSuggestion {
    
    color;
    coord;
    visits;
    winrate;
    scoreLead;
    grade;

    constructor(color, coord, visits, winrate, scoreLead) {
        this.color = color;
        this.coord = coord;
        this.visits = visits;
        this.winrate = winrate;
        this.scoreLead = scoreLead;
    }

    isPass() {
        return this.coord == "pass";
    }

}