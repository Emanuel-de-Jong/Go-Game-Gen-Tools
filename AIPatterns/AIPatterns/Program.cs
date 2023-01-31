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
            List<string> paths = new();
            paths.AddRange(Directory.GetDirectories(@"E:\Coding\Repos\GoTrainer-HumanAI\sgfs\learning\B"));
            paths.AddRange(Directory.GetDirectories(@"E:\Coding\Repos\GoTrainer-HumanAI\sgfs\learning\W"));

            SequenceGenerator sequenceGenerator = new();
            string savePathDir = @"E:\Coding\Repos\GoTrainer-HumanAI\sgfs\";
            foreach (string path in paths)
            {
                char color = Path.GetDirectoryName(path).Last();
                string sequenceName = Path.GetFileName(path);

                SequenceList sequenceList = sequenceGenerator.Generate(new string[] { path }, color, sequenceName);

                CreateFilteredSGF(sequenceList, savePathDir + color + "-" + sequenceName, 0, 1_000_000);
            }
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

            game.SaveAsSgf(savePath);
            //game.SaveAsSgf(savePath +
            //    "-" + maxDiff +
            //    "-" + min);
        }

        void Test()
        {
            GameWrap game = GameUtils.OpenFile(@"E:\Media\Downloads\test.sgf");



            game.SaveAsSgf(@"E:\Media\Downloads\test2");
        }

    }
}