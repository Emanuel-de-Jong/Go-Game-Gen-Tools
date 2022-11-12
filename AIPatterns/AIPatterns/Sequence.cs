using IGOEnchi.GoGameLogic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AIPatterns
{
    internal class Sequence : List<Stone>
    {
        public GameWrap ToGame()
        {
            GameWrap game = new();

            foreach (Stone stone in this)
            {
                game.PlaceStone(stone);
            }

            return game;
        }

        public void PrintBoard(bool fromStart = true)
        {
            ToGame().PrintBoard(fromStart);
        }

        public void PrintStones()
        {
            ToGame().PrintStones();
        }
    }
}
