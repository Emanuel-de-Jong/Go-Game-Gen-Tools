namespace TempAPI.KataGo
{
    public class MoveSuggestion
    {
        public Move move { get; set; }
        public int visits { get; set; }
        public float winrate { get; set; }
        public float scoreLead { get; set; }

        public MoveSuggestion() { }

        public MoveSuggestion(string color, string coord, string visits, string winrate, string scoreLead)
        {
            SetMove(color, coord);
            SetVisits(visits);
            SetWinrate(winrate);
            SetScoreLead(scoreLead);
        }

        public MoveSuggestion(string color, string coord, int visits, float winrate, float scoreLead)
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
            this.winrate = (float)(Math.Round(float.Parse(winrate) * 10_000.0) / 100.0);
        }

        public void SetScoreLead(string scoreLead)
        {
            this.scoreLead = (float)(Math.Round(float.Parse(scoreLead) * 10.0) / 10.0);
        }
    }
}
