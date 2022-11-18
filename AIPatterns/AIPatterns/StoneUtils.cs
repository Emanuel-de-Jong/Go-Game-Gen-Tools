using IGOEnchi.GoGameLogic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AIPatterns
{
    internal class StoneUtils
    {
        public static bool IsPass(Stone stone)
        {
            return stone.X == 20;
        }

        public static void Print(Stone stone)
        {
            Console.WriteLine(stone.X + ", " + stone.Y + ": " + (stone.IsBlack ? "B" : "W"));
        }
    }
}
