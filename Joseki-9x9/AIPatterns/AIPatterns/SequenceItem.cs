using IGOEnchi.GoGameLogic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AIPatterns
{
    internal class SequenceItem
    {
        public Stone Stone { get; set; }
        public BitPlane Black { get; set; }

        public BitPlane White { get; set; }
        public BitPlane BlackAndWhite => White.Copy().Or(Black);

        public SequenceItem(Stone stone, Board board)
        {
            Stone = stone;
            Black = board.Black.Copy();
            White = board.White.Copy();
        }
    }
}
