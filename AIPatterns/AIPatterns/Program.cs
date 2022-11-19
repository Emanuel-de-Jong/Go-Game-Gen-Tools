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
            GameWrap game = TreeBuilder.SequenceListToGame(sequenceList, false);
            TreeBuilder.AddMarkup(game);

            game.SaveAsSgf(savePath);
        }

        void createFilteredSGF(SequenceList sequenceList, string savePath)
        {
            GameWrap game = TreeBuilder.SequenceListToGame(sequenceList, false);
            foreach (GoNode node in game.Game.RootNode.ChildNodes)
            {
                GoMoveNode? move = node as GoMoveNode;
                if (move == null) continue;

                int minCount = 0;
                Stone stone = move.Stone;
                if (stone.X == G.BOARD_SIZE_INDEX - 3 && stone.Y == 3) // 4-4 3149
                {
                    minCount = 6;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 2 && stone.Y == 3) // 3-4 2423
                {
                    minCount = 6;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 3 && stone.Y == 4) // 4-5 433
                {
                    minCount = 4;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 2 && stone.Y == 4) // 3-5 440
                {
                    minCount = 4;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 2 && stone.Y == 2) // 3-3 336
                {
                    minCount = 4;
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