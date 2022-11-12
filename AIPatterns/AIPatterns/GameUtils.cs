using IGOEnchi.GoGameLogic;
using IGOEnchi.GoGameSgf;
using IGOEnchi.SmartGameLib;
using IGOEnchi.SmartGameLib.io;

namespace AIPatterns
{
    internal class GameUtils
    {
        public static GameWrap OpenFile(string path)
        {
            using var fileStream = File.OpenRead(path);

            var gameTree = SgfReader.LoadFromStream(fileStream);
            return new GameWrap(SgfCompiler.Compile(gameTree));
        }

        public static GameWrap Rotate(GameWrap oldGame)
        {
            oldGame.ToStart();

            GameWrap game = new();
            do
            {
                GoMoveNode? move = oldGame.Game.CurrentNode as GoMoveNode;
                if (move != null)
                {
                    var stone = move.Stone;
                    game.PlaceStone(new Stone(
                        stone.Y,
                        G.BOARD_SIZE_INDEX - stone.X,
                        stone.IsBlack));
                }
            }
            while (oldGame.ToNextMove());

            return game;
        }

        public static GameWrap Flip(GameWrap oldGame, bool flipHorizontal)
        {
            oldGame.ToStart();

            GameWrap game = new();
            do
            {
                GoMoveNode? move = oldGame.Game.CurrentNode as GoMoveNode;
                if (move != null)
                {
                    var stone = move.Stone;
                    game.PlaceStone(new Stone(
                        !flipHorizontal ? G.BOARD_SIZE_INDEX - stone.X : stone.X,
                        flipHorizontal ? G.BOARD_SIZE_INDEX - stone.Y : stone.Y,
                        stone.IsBlack));
                }
            }
            while (oldGame.ToNextMove());

            return game;
        }

        public static void PrintStone(Stone stone)
        {
            Console.WriteLine(stone.X + ", " + stone.Y + ": " + (stone.IsBlack ? "B" : "W"));
        }

        public static GameWrap SequenceListToGame(SequenceList sequenceList)
        {
            GameWrap game = new();

            foreach (Sequence sequence in sequenceList)
            {
                foreach (Stone stone in sequence)
                {
                    if (!game.Continue(stone))
                    {
                        game.PlaceStone(stone);
                    }
                }
                game.ToStart();
            }

            return game;
        }

        public static StoneTreeNode SequenceListToStoneTree(SequenceList sequenceList)
        {
            StoneTreeNode root = new();

            foreach (Sequence sequence in sequenceList)
            {
                StoneTreeNode currentNode = root;

                foreach (Stone stone in sequence)
                {
                    StoneTreeNode? childNode = currentNode.Find(stone);
                    if (childNode == null)
                    {
                        childNode = new StoneTreeNode(stone);
                        currentNode.Add(childNode);
                    }

                    currentNode = childNode;
                }
            }

            return root;
        }
    }
}
