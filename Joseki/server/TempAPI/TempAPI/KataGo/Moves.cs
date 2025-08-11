namespace TempAPI.KataGo
{
    public class Moves
    {
        public Move[] moves { get; set; } = Array.Empty<Move>();

        public override string ToString()
        {
            string output = "";
            foreach (Move move in moves)
            {
                output += move.ToString() + ", ";
            }
            return output;
        }
    }
}
