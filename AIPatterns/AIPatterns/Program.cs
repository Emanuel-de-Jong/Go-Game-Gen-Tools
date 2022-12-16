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
            Start(EState.B);
            Start(EState.W);
            //Test();
        }

        void Start(EState state)
        {
            SequenceGenerator sequenceGenerator = new();

            Dictionary<string, EState> paths = new Dictionary<string, EState>();
            if (state == EState.B)
            {
                paths.Add(@"E:\Coding\Repos\GoTrainer-HumanAI-Joseki\sgfs\learning\9x9\B\", EState.B);
                paths.Add(@"E:\Coding\Repos\GoTrainer-HumanAI-Joseki\sgfs\learning\9x9\BH\", EState.BH);
            } else
            {
                paths.Add(@"E:\Coding\Repos\GoTrainer-HumanAI-Joseki\sgfs\learning\9x9\W\", EState.W);
                paths.Add(@"E:\Coding\Repos\GoTrainer-HumanAI-Joseki\sgfs\learning\9x9\WH\", EState.WH);
            }

            SequenceList sequenceList = sequenceGenerator.Generate(paths);

            string savePathDir = @"E:\Coding\Repos\GoTrainer-HumanAI-Joseki\sgfs\";
            CreateFullSgf(sequenceList, savePathDir + "AI-Josekis-9x9-All", state);
            CreateFilteredSGF(sequenceList, savePathDir + "AI-Josekis-9x9-", state, 0.10f, 10);
            CreateFilteredSGF(sequenceList, savePathDir + "AI-Josekis-9x9-", state, 0.25f, 15);
            CreateFilteredSGF(sequenceList, savePathDir + "AI-Josekis-9x9-", state, 0.40f, 20);
        }

        void CreateFullSgf(SequenceList sequenceList, string savePath, EState state)
        {
            GameWrap game = TreeBuilder.SequenceListToGame(sequenceList, false, state);
            TreeBuilder.AddMarkup(game);

            game.SaveAsSgf(savePath + "-" + state);
        }

        void CreateFilteredSGF(SequenceList sequenceList, string savePath, EState state, float maxDiff, int min)
        {
            GameWrap game = TreeBuilder.SequenceListToGame(sequenceList, false, state);

            TreeBuilder.KeepHighestCount(game.Game.RootNode, state);

            foreach (GoNode node in game.Game.RootNode.ChildNodes)
            {
                GoSetupNode? setupNode = node as GoSetupNode;
                if (setupNode == null) continue;

                switch (game.SetupNodes[setupNode])
                {
                    case EState.B:
                        foreach (GoNode childNode in setupNode.ChildNodes[0].ChildNodes)
                        {
                            TreeBuilder.FilterByCount(childNode, maxDiff, min);
                        }
                        break;
                    case EState.W:
                        foreach (GoNode childNode in setupNode.ChildNodes)
                        {
                            TreeBuilder.FilterByCount(childNode, maxDiff, min);
                        }
                        break;
                    case EState.BH:
                        foreach (GoNode childNode in setupNode.ChildNodes)
                        {
                            TreeBuilder.FilterByCount(childNode, maxDiff, min);
                        }
                        break;
                    case EState.WH:
                        foreach (GoNode childNode in setupNode.ChildNodes[0].ChildNodes)
                        {
                            TreeBuilder.FilterByCount(childNode, maxDiff, min);
                        }
                        break;
                }
            }

            TreeBuilder.AddMarkup(game);

            game.SaveAsSgf(savePath +
                "-" + state +
                "-" + maxDiff +
                "-" + min
                );
        }

        void Test()
        {
            GameWrap game = GameUtils.OpenFile(@"E:\Media\Downloads\test.sgf");



            game.SaveAsSgf(@"E:\Media\Downloads\test2");
        }

    }
}