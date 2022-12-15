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
                string[] sgfPaths = Directory.GetFiles(path, "*.sgf", SearchOption.AllDirectories);
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
            // Check if first stone exists and is black
            game.ToStart();
            GoMoveNode? move = GetNextMoveInRange(game);
            if (move == null) return;

            // Find first non diagnally centered stone
            //game.ToStart();
            //do
            //{
            //    move = GetNextMoveInRange(game);
            //    if (move == null) return;

            //} while (G.BOARD_SIZE_INDEX - move.Stone.X == move.Stone.Y);

            //// Flip board if stone on wrong side
            //if (G.BOARD_SIZE_INDEX - move.Stone.X > move.Stone.Y)
            //{
            //    game = GameUtils.Rotate(game);
            //    game = GameUtils.Flip(game, false);
            //}

            Sequence sequence = new();

            int handicap = game.Game.Info.Handicap;
            switch (handicap)
            {
                case 2:
                    sequence.Add(new Stone(6, 2, true), game);
                    sequence.Add(new Stone(2, 6, true), game);
                    break;
                case 3:
                    sequence.Add(new Stone(2, 2, true), game);
                    sequence.Add(new Stone(6, 2, true), game);
                    sequence.Add(new Stone(2, 6, true), game);
                    break;
                case 4:
                    sequence.Add(new Stone(2, 2, true), game);
                    sequence.Add(new Stone(6, 2, true), game);
                    sequence.Add(new Stone(2, 6, true), game);
                    sequence.Add(new Stone(6, 6, true), game);
                    break;
            }

            game.ToStart();
            while (game.ToNextMove())
            {
                move = game.Game.CurrentNode as GoMoveNode;
                if (move != null)
                {
                    sequence.Add(move, game);
                }
            }

            sequenceList.Add(sequence);
        }

        GoMoveNode? GetNextMoveInRange(GameWrap game)
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
