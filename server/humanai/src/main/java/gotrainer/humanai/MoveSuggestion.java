package gotrainer.humanai;

public class MoveSuggestion {

    public Move move;
    public int visits;
    public float winrate;
    public float scoreLead;


    public MoveSuggestion() {}

    public MoveSuggestion(String color, String coord, int visits, float winrate, float scoreLead) {
        this.move = new Move(color, coord);
        this.visits = visits;
        this.winrate = winrate;
        this.scoreLead = scoreLead;
    }

}
