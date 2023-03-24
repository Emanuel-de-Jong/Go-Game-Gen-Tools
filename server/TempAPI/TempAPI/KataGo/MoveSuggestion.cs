namespace TempAPI.KataGo
{
    public class MoveSuggestion
    {
        public Move move { get; set; }
        public int visits { get; set; }
        public int winrate { get; set; }
        public int scoreLead { get; set; }

        public MoveSuggestion() { }

        public MoveSuggestion(string color, string coord, string visits, string winrate, string scoreLead)
        {
            SetMove(color, coord);
            SetVisits(visits);
            SetWinrate(winrate);
            SetScoreLead(scoreLead);
        }

        public MoveSuggestion(string color, string coord, int visits, int winrate, int scoreLead)
        {
            SetMove(color, coord);
            this.visits = visits;
            this.winrate = winrate;
            this.scoreLead = scoreLead;
        }

        public void SetMove(string color, string coord)
        {
            move = new Move(color, coord);
        }

        public void SetVisits(string visits)
        {
            this.visits = int.Parse(visits);
        }

        public void SetWinrate(string winrate)
        {
            this.winrate = (int)(float.Parse(winrate) * 100_000_000);
            if (move.color == "W") this.winrate = 100_000_000 - this.winrate;
        }

        public void SetScoreLead(string scoreLead)
        {
            this.scoreLead = (int)(float.Parse(scoreLead) * 1_000_000);
            if (move.color == "W") this.scoreLead *= -1;
        }
    }
}
