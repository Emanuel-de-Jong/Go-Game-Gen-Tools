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
        }

        void Start()
        {
            SequenceGenerator sequenceGenerator = new();
            SequenceList sequenceList = sequenceGenerator.Generate(new string[] {
                @"D:\Other\Mega\MEGAsync\Go\SGF\AI-Training-Data\GoTrainer-HumanAI-joseki\kata1-b18c384nbt-s8980552704-d4047449493\1-instances-24-threads",
                @"D:\Other\Mega\MEGAsync\Go\SGF\AI-Training-Data\GoTrainer-HumanAI-joseki\kata1-b18c384nbt-s8980552704-d4047449493\1-instances-48-threads",
                @"D:\Other\Mega\MEGAsync\Go\SGF\AI-Training-Data\GoTrainer-HumanAI-joseki\kata1-b18c384nbt-s8980552704-d4047449493\6-instances-8-threads",
                @"D:\Other\Mega\MEGAsync\Go\SGF\AI-Training-Data\GoTrainer-HumanAI-joseki\kata1-b18c384nbt-s8980552704-d4047449493\6-instances-24-threads",
                @"D:\Other\Mega\MEGAsync\Go\SGF\AI-Training-Data\GoTrainer-HumanAI-joseki\kata1-b18c384nbt-s8980552704-d4047449493\6-instances-48-threads",
                });

            string savePathDir = @"D:\Coding\Repos\GoTrainer-HumanAI-joseki\sgfs\";
            //CreateFullSgf(sequenceList, savePathDir + "AI-Josekis-All");
            CreateFilteredSGF(sequenceList, savePathDir + "AI-Josekis", true, 0.3f, 9, 10, 8, 8, 6);
        }

        void CreateFullSgf(SequenceList sequenceList, string savePath)
        {
            GameWrap game = TreeBuilder.SequenceListToGame(sequenceList, false);
            TreeBuilder.AddMarkup(game);

            game.SaveAsSgf(savePath);
        }

        void CreateFilteredSGF(SequenceList sequenceList, string savePath, bool filterSecondLayer, float minPercOfHighest, int min44, int min34, int min45, int min35, int min33)
        {
            GameWrap game = TreeBuilder.SequenceListToGame(sequenceList, false);
            foreach (GoNode node in game.Game.RootNode.ChildNodes)
            {
                GoMoveNode? move = node as GoMoveNode;
                if (move == null) continue;

                int minCount = 0;
                Stone stone = move.Stone;
                if (stone.X == G.BOARD_SIZE_INDEX - 3 && stone.Y == 3)
                {
                    minCount = min44;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 2 && stone.Y == 3)
                {
                    minCount = min34;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 3 && stone.Y == 4)
                {
                    minCount = min45;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 2 && stone.Y == 4)
                {
                    minCount = min35;
                }
                else if (stone.X == G.BOARD_SIZE_INDEX - 2 && stone.Y == 2)
                {
                    minCount = min33;
                }

                if (filterSecondLayer)
                {
                    TreeBuilder.FilterByCount(node, 0, 10);
                }

                foreach (GoNode childNode in node.ChildNodes)
                {
                    TreeBuilder.FilterByCountLoop(childNode, minPercOfHighest, minCount);
                    TreeBuilder.RemoveLongestNonMinCountMovesLoop(childNode, minCount);
                }
            }

            TreeBuilder.AddMarkup(game);
            TreeBuilder.RemoveRedundentPasses(game);

            game.SaveAsSgf(savePath +
                "-" + filterSecondLayer +
                "-" + minPercOfHighest +
                "-" + min44 +
                "-" + min34 +
                "-" + min45 +
                "-" + min35 +
                "-" + min33);
        }
    }
}