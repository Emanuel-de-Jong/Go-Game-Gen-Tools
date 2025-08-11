using System.ComponentModel.DataAnnotations;

namespace TempAPI.KataGo
{
    public class Move
    {
        [RegularExpression(@"(B|W)")]
        public string color { get; set; }
        [RegularExpression(@"([A-H]|[J-T])(1[0-9]|[1-9])")]
        public string coord { get; set; }

        public Move() { }

        public Move(string color, string coord)
        {
            this.color = color;
            this.coord = coord;
        }

        public override string ToString()
        {
            return "{ color: " + color +
                ", coord: " + coord + " }";
        }
    }
}
