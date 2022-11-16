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
                @"E:\Coding\Repos\GoTrainer-HumanAI\sgfs\learning",
                });

            GameWrap game = TreeBuilder.SequenceListToGame(sequenceList);
            
            //TreeBuilder.FilterByCount(game.Game.RootNode, 6);

            foreach (GoNode node in game.Game.RootNode.ChildNodes)
            {
                GoMoveNode? move = node as GoMoveNode;
                if (move == null) continue;

                int minCount = 0;
                Stone stone = move.Stone;
                if (stone.X == G.BOARD_SIZE_INDEX - 3 && stone.Y == 3) // 4-4 1685
                {
                    minCount = 7;
                } else if (stone.X == G.BOARD_SIZE_INDEX - 2 && stone.Y == 3) // 3-4 1207
                {
                    minCount = 6;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 3 && stone.Y == 4) // 4-5 251
                {
                    minCount = 4;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 2 && stone.Y == 4) // 3-5 247
                {
                    minCount = 4;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 2 && stone.Y == 2) // 3-3 151
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



            game.SaveAsSgf(@"E:\Media\Downloads\test2.sgf");
        }

    }
}