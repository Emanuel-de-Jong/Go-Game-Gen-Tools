package gotrainer.humanai;

public class MoveSuggestion {

    public String coord;
    public int visits;
    public float winrate;
    public float scoreLead;
    public float scoreStdev;


    public MoveSuggestion() {}

    public MoveSuggestion(String coord, int visits, float winrate, float scoreLead, float scoreStdev) {
        this.coord = coord;
        this.visits = visits;
        this.winrate = winrate;
        this.scoreLead = scoreLead;
        this.scoreStdev = scoreStdev;
    }

}
