using IGOEnchi.GoGameLogic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AIPatterns
{
    internal class Sequence : List<KeyValuePair<Stone, List<Stone>>>
    {
        public GameWrap ToGame()
        {
            GameWrap game = new();

            foreach (KeyValuePair<Stone, List<Stone>> pair in this)
            {
                game.PlaceStone(pair.Key);
            }

            return game;
        }

        public void Add(Stone stone, List<Stone> allStones)
        {
            Add(new KeyValuePair<Stone, List<Stone>>(stone, new List<Stone>(allStones)));
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
