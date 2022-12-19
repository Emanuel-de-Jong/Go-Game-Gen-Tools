namespace TempAPI.KataGo
{
    public class Moves
    {
        public Move[] moves { get; set; }

        public override string ToString()
        {
            string output = "";
            foreach (var move in moves)
            {
                output += move.ToString() + ", ";
            }
            return output;
        }
    }
}
