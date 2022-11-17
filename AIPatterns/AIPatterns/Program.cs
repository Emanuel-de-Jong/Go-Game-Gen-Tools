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

            string savePathDir = @"E:\Coding\Repos\GoTrainer-HumanAI\sgfs\";
            createFullSgf(sequenceList, savePathDir + "AI-Josekis-All.sgf");
            createFilteredSGF(sequenceList, savePathDir + "AI-Josekis.sgf");
        }

        void createFullSgf(SequenceList sequenceList, string savePath)
        {
            GameWrap game = TreeBuilder.SequenceListToGame(sequenceList);
            TreeBuilder.AddMarkup(game);

            game.SaveAsSgf(savePath);
        }

        void createFilteredSGF(SequenceList sequenceList, string savePath)
        {
            GameWrap game = TreeBuilder.SequenceListToGame(sequenceList);
            foreach (GoNode node in game.Game.RootNode.ChildNodes)
            {
                GoMoveNode? move = node as GoMoveNode;
                if (move == null) continue;

                int minCount = 0;
                Stone stone = move.Stone;
                if (stone.X == G.BOARD_SIZE_INDEX - 3 && stone.Y == 3) // 4-4 2060
                {
                    minCount = 6;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 2 && stone.Y == 3) // 3-4 1511
                {
                    minCount = 5;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 3 && stone.Y == 4) // 4-5 302
                {
                    minCount = 3;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 2 && stone.Y == 4) // 3-5 277
                {
                    minCount = 3;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 2 && stone.Y == 2) // 3-3 209
                {
                    minCount = 3;
                }

                TreeBuilder.FilterByCount(node, minCount);
            }

            TreeBuilder.RemoveRedundentPasses(game);
            TreeBuilder.AddMarkup(game);

            game.SaveAsSgf(savePath);
        }

        void Test()
        {
            GameWrap game = GameUtils.OpenFile(@"E:\Media\Downloads\test.sgf");



            game.SaveAsSgf(@"E:\Media\Downloads\test2.sgf");
        }

    }
}