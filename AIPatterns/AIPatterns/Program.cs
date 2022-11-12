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
            SequenceList sequenceList = sequenceGenerator.Generate(@"E:\Media\Downloads\AIPatterns\AIPatterns\sgfs\");

            StoneTreeNode StoneTree = GameUtils.SequenceListToStoneTree(sequenceList);

            PatternFinder patternFinder = new(StoneTree);

            GameWrap game = GameUtils.SequenceListToGame(sequenceList);

            game.SaveAsSgf(@"E:\Media\Downloads\AI-Josekis.sgf");
        }

        void Test()
        {
            GameWrap game = GameUtils.OpenFile(@"E:\Media\Documents\MEGAsync\Go\Learning\AI-Josekis\1_12-11_13-54-07.sgf");
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