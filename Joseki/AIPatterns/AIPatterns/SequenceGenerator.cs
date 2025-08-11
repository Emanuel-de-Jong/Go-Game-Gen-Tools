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

                    int countMultiplier = 1;

                    int visits = int.Parse(Path.GetFileNameWithoutExtension(sgfPath).Split("_")[0]);
                    switch (visits)
                    {
                        case 5000:
                            countMultiplier = 2;
                            break;
                        case 10000:
                            countMultiplier = 3;
                            break;
                        case 15000:
                            countMultiplier = 4;
                            break;
                    }

                    AddSequencesFromGame(game, countMultiplier);
                }
            }

            //foreach (Sequence sequence in sequenceList)
            //{
            //    sequence.PrintBoard();
            //}

            return sequenceList;
        }

        void AddSequencesFromGame(GameWrap game, int countMultiplier)
        {
            for (int i = 0; i < 4; i++)
            {
                AddSequenceFromGame(game, countMultiplier);
                if (i < 4)
                {
                    game = GameUtils.Rotate(game);
                }
            }
        }

        void AddSequenceFromGame(GameWrap game, int countMultiplier)
        {
            // Check if first stone exists and is black
            game.ToStart();
            GoMoveNode? move = GetNextMoveInRange(game);
            if (move == null) return;
            bool isFirstStoneBlack = move.Stone.IsBlack;

            // Check if second stone exists and is in range
            move = GetNextMoveInRange(game);
            if (move == null) return;
            if (!IsMoveInRange(move, SECOND_STONE_RANGE_X, SECOND_STONE_RANGE_Y)) return;

            // Swap all stone colors if first stone not black
            if (!isFirstStoneBlack)
            {
                game.ToStart();
                while (game.ToNextMove())
                {
                    move = game.Game.CurrentNode as GoMoveNode;
                    if (move != null)
                    {
                        move.Stone.IsBlack = !move.Stone.IsBlack;
                    }
                }
            }

            // Find first non diagnally centered stone
            game.ToStart();
            do
            {
                move = GetNextMoveInRange(game);
                if (move == null) return;

            } while (G.BOARD_SIZE_INDEX - move.Stone.X == move.Stone.Y);

            // Flip board if stone on wrong side
            if (G.BOARD_SIZE_INDEX - move.Stone.X > move.Stone.Y)
            {
                game = GameUtils.Rotate(game);
                game = GameUtils.Flip(game, false);
            }

            Sequence sequence = new(countMultiplier);

            // Add first stone
            game.ToStart();
            move = GetNextMoveInRange(game);

            sequence.Add(move, game);
            GoMoveNode lastMove = move;

            // Add second stone
            move = GetNextMoveInRange(game);
            if (move.Stone.IsBlack)
            {
                sequence.Add(new Stone(20, 20, false), lastMove.BoardCopy);
            }

            sequence.Add(move, game);
            lastMove = move;

            // Add other stones
            bool moveOutOfRange = false;
            bool lastColorBlack = move.Stone.IsBlack;
            while (game.ToNextMove())
            {
                move = game.Game.CurrentNode as GoMoveNode;
                if (move != null)
                {
                    if (IsMoveInRange(move))
                    {
                        if (moveOutOfRange)
                        {
                            sequence.Add(new Stone(20, 20, !lastColorBlack), lastMove.BoardCopy);

                            if (move.Stone.IsBlack != lastColorBlack)
                            {
                                sequence.Add(new Stone(20, 20, lastColorBlack), lastMove.BoardCopy);
                            }
                        }

                        sequence.Add(move, game);
                        lastMove = move;

                        moveOutOfRange = false;
                        lastColorBlack = move.Stone.IsBlack;
                    } else
                    {
                        moveOutOfRange = true;
                    }
                }
            }

            sequence.Add(new Stone(20, 20, !lastColorBlack), lastMove.BoardCopy);

            sequenceList.Add(sequence);
        }

        GoMoveNode? GetNextMoveInRange(GameWrap game)
        {
            while (game.ToNextMove())
            {
                GoMoveNode? move = game.Game.CurrentNode as GoMoveNode;
                if (move != null && IsMoveInRange(move))
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
