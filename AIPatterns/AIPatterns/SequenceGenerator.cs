using IGOEnchi.GoGameLogic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Formats.Asn1.AsnWriter;

namespace AIPatterns
{
    internal class SequenceGenerator
    {
        const int COUNT_RANGE_Y = 10;
        const int COUNT_RANGE_X = G.BOARD_SIZE_INDEX - COUNT_RANGE_Y;

        const int SECOND_STONE_RANGE_Y = 7;
        const int SECOND_STONE_RANGE_X = G.BOARD_SIZE_INDEX - SECOND_STONE_RANGE_Y;

        SequenceList sequenceList = new();

        public SequenceList Generate(string[] paths)
        {
            sequenceList = new SequenceList();

            foreach (string path in paths)
            {
                string[] sgfPaths = Directory.GetFiles(path, "*.sgf");
                foreach (string sgfPath in sgfPaths)
                {
                    GameWrap game = GameUtils.OpenFile(sgfPath);
                    AddSequencesFromGame(game);
                }
            }

            //foreach (Sequence sequence in sequenceList)
            //{
            //    sequence.PrintBoard();
            //}

            return sequenceList;
        }

        void AddSequencesFromGame(GameWrap game)
        {
            AddSequenceFromGame(game);
        }

        void AddSequenceFromGame(GameWrap game)
        {
            game.ToStart();
            Sequence sequence = new();
            while (game.ToNextMove())
            {
                GoMoveNode? move = game.Game.CurrentNode as GoMoveNode;
                if (move != null)
                {
                    sequence.Add(move, game);
                }
            }

            sequenceList.Add(sequence);
        }

        GoMoveNode? GetNextMove(GameWrap game)
        {
            while (game.ToNextMove())
            {
                GoMoveNode? move = game.Game.CurrentNode as GoMoveNode;
                if (move != null)
                {
                    return move;
                }
            }

            return null;
        }

        bool IsMoveInRange(GoMoveNode move, int rangeX = COUNT_RANGE_X, int rangeY = COUNT_RANGE_Y)
        {
            if (move.Stone.X >= rangeX && move.Stone.Y <= rangeY)
            {
                return true;
            }
            return false;
        }
    }
}
