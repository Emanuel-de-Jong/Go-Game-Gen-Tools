package gotrainer.humanai;

public class MoveSuggestion {

    public Move move;
    public int visits;
    public float winrate;
    public float scoreLead;


    public MoveSuggestion() {}

    public MoveSuggestion(String color, String coord, String visits, String winrate, String scoreLead) {
        setMove(color, coord);
        setVisits(visits);
        setWinrate(winrate);
        setScoreLead(scoreLead);
    }

    public void setMove(String color, String coord) {
        this.move = new Move(color, coord);
    }

    public void setVisits(String visits) {
        this.visits = Integer.parseInt(visits);
    }

    public void setWinrate(String winrate) {
        this.winrate = Math.round(Float.parseFloat(winrate) * 10000) / 100f;
    }

    public void setScoreLead(String scoreLead) {
        this.scoreLead = Math.round(Float.parseFloat(scoreLead) * 10) / 10f;
    }

}
