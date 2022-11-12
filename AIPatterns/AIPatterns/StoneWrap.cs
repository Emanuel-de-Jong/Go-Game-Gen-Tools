using IGOEnchi.GoGameLogic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;

namespace AIPatterns
{
    internal class StoneWrap : Stone
    {
        public StoneWrap(int x, int y, bool isBlack) : base(x, y, isBlack)
        {
        }

        public StoneWrap(Stone stone) : base(stone)
        {
        }

        public void Print()
        {
            Print(this);
        }

        public static void Print(Stone stone)
        {
            Console.WriteLine(stone.X + ", " + stone.Y + ": " + (stone.IsBlack ? "B" : "W"));
        }
    }
}
