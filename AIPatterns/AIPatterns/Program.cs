using IGOEnchi.GoGameLogic;
using IGOEnchi.SmartGameLib;
using System.Reflection;

namespace AIPatterns
{
    internal class Program
    {

        static void Main(string[] args)
        {
            new Program();
        }

        public Program()
        {
            Start();
            //Test();
        }

        void Start()
        {
            SequenceGenerator sequenceGenerator = new();
            SequenceList sequenceList = sequenceGenerator.Generate(new string[] {
                @"E:\Media\Documents\MEGAsync\Go\Learning\AI-Josekis\",
                @"E:\Media\Documents\MEGAsync\Go\Learning\AI-Josekis\1s with first stone 5"
                });

            //StoneTreeNode StoneTree = TreeBuilder.SequenceListToStoneTree(sequenceList);

            GameWrap game = TreeBuilder.SequenceListToGame(sequenceList);
            
            //TreeBuilder.FilterByCount(game.Game.RootNode, 6);

            foreach (GoNode node in game.Game.RootNode.ChildNodes)
            {
                GoMoveNode? move = node as GoMoveNode;
                if (move == null) continue;

                int minCount = 6;

                Stone stone = move.Stone;
                if (stone.X == G.BOARD_SIZE_INDEX - 3 && stone.Y == 3) // 4-4
                {
                    minCount = 6;
                } else if (stone.X == G.BOARD_SIZE_INDEX - 2 && stone.Y == 3) // 3-4
                {
                    minCount = 6;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 3 && stone.Y == 4) // 4-5
                {
                    minCount = 4;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 2 && stone.Y == 4) // 3-5
                {
                    minCount = 4;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 2 && stone.Y == 2) // 3-3
                {
                    minCount = 3;
                }

                TreeBuilder.FilterByCount(node, minCount);
            }

            TreeBuilder.RemoveRedundentPasses(game);
            TreeBuilder.AddMarkup(game);

            game.SaveAsSgf(@"E:\Media\Downloads\AI-Josekis.sgf");
        }

        void Test()
        {
            GameWrap game = GameUtils.OpenFile(@"E:\Media\Downloads\test.sgf");
            game.PlaceStone(new Stone(20, 20, true));
            game.PlaceStone(new Stone(6, 14, false));
            game.Game.currentNode.EnsureMarkup();
            game.Game.currentNode.Markup.Marks.Add(new Mark(17, 17, MarkType.Square));
            game.SaveAsSgf(@"E:\Media\Downloads\test2.sgf");



            //    GameWrap game = new GameWrap();
            //    game.PlaceStone(new Stone(3, 6, true));

            //    GameUtils.PrintBoard(game);
            //    GameUtils.PrintStones(game);

            //    for (int i = 0; i < 4; i++)
            //    {
            //        GameUtils.PrintBoard(game);
            //        game = GameUtils.Rotate(game);
            //    }

            //    GameUtils.PrintBoard(game);
            //    GameUtils.PrintBoard(GameUtils.Flip(game, true));
            //    GameUtils.PrintBoard(GameUtils.Flip(game, false));
            //    GameUtils.PrintBoard(GameUtils.Flip(GameUtils.Flip(game, true), false));
        }

    }
}