using IGOEnchi.GoGameLogic;
using IGOEnchi.GoGameSgf;
using IGOEnchi.SmartGameLib.io;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AIPatterns
{
    internal class GameWrap
    {
        public GoGame Game { get; set; }

        public GameWrap()
        {
            Game = new GoGame(G.BOARD_SIZE);
        }

        public GameWrap(GoGame game)
        {
            this.Game = game;
        }

        public void PrintBoard(bool fromStart = true)
        {
            if (fromStart)
            {
                ToStart();
                while (ToNextMove()) { }
            }

            string toPrint = "";
            for (int y = 0; y < G.BOARD_SIZE; y++)
            {
                for (int x = 0; x < G.BOARD_SIZE; x++)
                {
                    string point = "·";
                    if (Game.board.HasBlack(x, y))
                    {
                        point = "B";
                    }
                    else if (Game.board.HasWhite(x, y))
                    {
                        point = "W";
                    }
                    toPrint += point + " ";
                }
                toPrint += "\n";
            }

            Console.WriteLine(toPrint);
        }

        public void SaveAsSgf(string path)
        {
            var builder = new GoSgfBuilder(Game);
            var sgf = builder.ToSGFTree();

            using var file = File.CreateText(path);

            var writer = new SgfWriter(file, true);
            writer.WriteSgfTree(sgf);
        }

        public void PrintStones()
        {
            ToStart();

            do
            {
                GoMoveNode? move = Game.CurrentNode as GoMoveNode;
                if (move != null)
                {
                    GameUtils.PrintStone(move.Stone);
                }
            }
            while (ToNextMove());
        }

        public void ToStart()
        {
            Game.ToStart();
        }

        public bool ToNextMove()
        {
            return Game.ToNextMove();
        }

        public void PlaceStone(Stone stone)
        {
            Game.PlaceStone(stone);
        }

        public void AddStone(Stone stone)
        {
            Game.AddStone(stone);
        }

        public bool Continue(Stone stone)
        {
            return Game.Continue(stone);
        }

    }
}
