using IGOEnchi.GoGameLogic;
using IGOEnchi.SmartGameLib;
using System.Reflection;
using System.Xml.Linq;

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
                @"E:\Coding\Repos\GoTrainer-HumanAI-Joseki\sgfs\learning\9x9\",
                });

            string savePathDir = @"E:\Coding\Repos\GoTrainer-HumanAI-Joseki\sgfs\";
            CreateFullSgf(sequenceList, savePathDir + "AI-Josekis-9x9-All");
            //CreateFilteredSGF(sequenceList, savePathDir + "AI-Josekis", false, 0.08f, 5, 5, 3, 3, 3);
            //CreateFilteredSGF(sequenceList, savePathDir + "AI-Josekis", false, 0.3f, 10, 9, 6, 6, 6);
        }

        void CreateFullSgf(SequenceList sequenceList, string savePath)
        {
            GameWrap game = TreeBuilder.SequenceListToGame(sequenceList, false);
            TreeBuilder.AddMarkup(game);

            game.SaveAsSgf(savePath);
        }

        void CreateFilteredSGF(SequenceList sequenceList, string savePath, bool filterSecondLayer, float maxDiff, int min44, int min34, int min45, int min35, int min33)
        {
            GameWrap game = TreeBuilder.SequenceListToGame(sequenceList, false);
            foreach (GoNode node in game.Game.RootNode.ChildNodes)
            {
                GoMoveNode? move = node as GoMoveNode;
                if (move == null) continue;

                int minCount = 0;
                Stone stone = move.Stone;
                if (stone.X == G.BOARD_SIZE_INDEX - 3 && stone.Y == 3) // 4-4 3657
                {
                    minCount = min44;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 2 && stone.Y == 3) // 3-4 2865
                {
                    minCount = min34;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 3 && stone.Y == 4) // 4-5 512
                {
                    minCount = min45;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 2 && stone.Y == 4) // 3-5 540
                {
                    minCount = min35;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 2 && stone.Y == 2) // 3-3 397
                {
                    minCount = min33;
                }

                if (filterSecondLayer)
                {
                    TreeBuilder.FilterByCount(node, maxDiff, minCount);
                } else
                {
                    foreach (GoNode childNode in node.ChildNodes)
                    {
                        TreeBuilder.FilterByCount(childNode, maxDiff, minCount);
                    }
                }
            }

            TreeBuilder.AddMarkup(game);
            TreeBuilder.RemoveRedundentPasses(game);

            game.SaveAsSgf(savePath +
                "-" + filterSecondLayer +
                "-" + maxDiff +
                "-" + min44 +
                "-" + min34 +
                "-" + min45 +
                "-" + min35 +
                "-" + min33);
        }

        void Test()
        {
            GameWrap game = GameUtils.OpenFile(@"E:\Media\Downloads\test.sgf");



            game.SaveAsSgf(@"E:\Media\Downloads\test2");
        }

    }
}