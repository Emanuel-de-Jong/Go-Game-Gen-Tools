using IGOEnchi.GoGameLogic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AIPatterns
{
    internal class Sequence : List<SequenceItem>
    {
        public GameWrap ToGame()
        {
            GameWrap game = new();

            foreach (SequenceItem item in this)
            {
                game.PlaceStone(item.Stone);
            }

            return game;
        }

        public void Add(GoMoveNode move, GameWrap game)
        {
            Add(new SequenceItem(move.Stone, game.Game.board));
        }

        public void Add(Stone stone, Board board)
        {
            Add(new SequenceItem(stone, board));
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
