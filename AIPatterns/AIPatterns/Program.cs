using IGOEnchi.GoGameLogic;
using IGOEnchi.SmartGameLib;
using System.Drawing;
using System.IO;
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
            string rootPath = @"E:\Coding\Repos\GoTrainer-HumanAI\sgfs\";

            SequenceGenerator sequenceGenerator = new();

            SequenceList sequenceListB = sequenceGenerator.Generate(new string[] { rootPath + @"learning\B" });
            SequenceList sequenceListW = sequenceGenerator.Generate(new string[] { rootPath + @"learning\W" });

            CreateFilteredSGF(sequenceListB, rootPath + "Perfect-Seq-B", 0, 1_000_000, true);
            CreateFilteredSGF(sequenceListW, rootPath + "Perfect-Seq-W", 0, 1_000_000, true);
            CreateFullSgf(sequenceListB, rootPath + "Perfect-Seq-B-Full");
            CreateFullSgf(sequenceListW, rootPath + "Perfect-Seq-W-Full");


            List<string> sequencePaths = new();
            sequencePaths.AddRange(Directory.GetDirectories(rootPath + @"learning\B"));
            sequencePaths.AddRange(Directory.GetDirectories(rootPath + @"learning\W"));
            foreach (string path in sequencePaths)
            {
                char color = Path.GetDirectoryName(path).Last();
                string sequenceName = Path.GetFileName(path);

                SequenceList sequenceList = sequenceGenerator.Generate(new string[] { path }, color, sequenceName);

                CreateFilteredSGF(sequenceList, rootPath + color + "-" + sequenceName, 0, 1_000_000, false);
                //CreateFullSgf(sequenceList, rootPath + color + "-" + sequenceName);
            }
        }

        void CreateFullSgf(SequenceList sequenceList, string savePath)
        {
            GameWrap game = TreeBuilder.SequenceListToGame(sequenceList, false);

            TreeBuilder.AddMarkup(game);

            game.SaveAsSgf(savePath);
        }

        void CreateFilteredSGF(SequenceList sequenceList, string savePath, float maxDiff, int min, bool addMarkup)
        {
            GameWrap game = TreeBuilder.SequenceListToGame(sequenceList, false);

            TreeBuilder.FilterByCount(game.Game.RootNode, maxDiff, min);
            if (addMarkup) TreeBuilder.AddMarkup(game);

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