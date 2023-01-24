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
                @"E:\Coding\Repos\GoTrainer-HumanAI\sgfs\learning\2000 visits",
                });

            string savePathDir = @"E:\Coding\Repos\GoTrainer-HumanAI\sgfs\";
            CreateFullSgf(sequenceList, savePathDir + "Perfect-Seq-All");
            CreateFilteredSGF(sequenceList, savePathDir + "Perfect-Seq", 0, 50);
            CreateFilteredSGF(sequenceList, savePathDir + "Perfect-Seq", 0, 1_000_000);
        }

        void CreateFullSgf(SequenceList sequenceList, string savePath)
        {
            GameWrap game = TreeBuilder.SequenceListToGame(sequenceList, false);

            TreeBuilder.AddMarkup(game);

            game.SaveAsSgf(savePath);
        }

        void CreateFilteredSGF(SequenceList sequenceList, string savePath, float maxDiff, int min)
        {
            GameWrap game = TreeBuilder.SequenceListToGame(sequenceList, false);

            TreeBuilder.FilterByCount(game.Game.RootNode, maxDiff, min);
            TreeBuilder.AddMarkup(game);

            game.SaveAsSgf(savePath +
                "-" + maxDiff +
                "-" + min);
        }

        void Test()
        {
            GameWrap game = GameUtils.OpenFile(@"E:\Media\Downloads\test.sgf");



            game.SaveAsSgf(@"E:\Media\Downloads\test2");
        }

    }
}