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
            return Generate(paths, null, null);
        }

        public SequenceList Generate(string[] paths, char? color, string? sequenceName)
        {
            sequenceList = new SequenceList();

            foreach (string path in paths)
            {
                string[] sgfPaths = Directory.GetFiles(path, "*.sgf", SearchOption.AllDirectories);
                foreach (string sgfPath in sgfPaths)
                {
                    GameWrap game = GameUtils.OpenFile(sgfPath);
                    AddSequenceFromGame(game, color, sequenceName);
                }
            }

            //foreach (Sequence sequence in sequenceList)
            //{
            //    sequence.PrintBoard();
            //}

            return sequenceList;
        }

        void AddSequenceFromGame(GameWrap game, char? color, string? sequenceName)
        {
            if (color != null)
            {
                GameWrap oldGame = game;

                Stone? stone = GetStone(game, 5);
                bool isGameChanged = false;
                if (color == 'B')
                {
                    if (sequenceName == "s4_3_n_17_16" && stone.X < G.BOARD_SIZE / 2)
                    {
                        game = GameUtils.FlipDiagonal(game, false);
                        isGameChanged = true;
                    }
                    else if (sequenceName == "s4_3_n_16_17" && stone.X < G.BOARD_SIZE / 2)
                    {
                        game = GameUtils.Flip(game, true);
                        game = GameUtils.Flip(game, false);
                        isGameChanged = true;
                    }
                    else if (sequenceName == "s3_4_n_3_16" && stone.Y < G.BOARD_SIZE / 2)
                    {
                        game = GameUtils.Flip(game, true);
                        isGameChanged = true;
                    }
                    else if (sequenceName == "s4_4_n_16_16")
                    {
                        if (stone.X < G.BOARD_SIZE / 2)
                        {
                            game = GameUtils.FlipDiagonal(game, false);
                            isGameChanged = true;
                        }
                        if (stone.X > stone.Y)
                        {
                            game = GameUtils.FlipDiagonal(game, true);
                            isGameChanged = true;
                        }
                    }
                    else if (sequenceName == "s4_16_n_4_4" && stone.Y < G.BOARD_SIZE / 2)
                    {
                        game = GameUtils.Flip(game, true);
                        isGameChanged = true;
                    }
                }
                else if (color == 'W')
                {
                    if (sequenceName == "s16_4_n_16_16" && stone.Y < G.BOARD_SIZE / 2)
                    {
                        game = GameUtils.Flip(game, true);
                        isGameChanged = true;
                    }
                    else if (sequenceName == "s17_4_n_3_16" && stone.Y < G.BOARD_SIZE / 2)
                    {
                        game = GameUtils.Flip(game, true);
                        game = GameUtils.Flip(game, false);
                        isGameChanged = true;
                    }
                    else if (sequenceName == "s17_4_n_4_17" && stone.Y < G.BOARD_SIZE / 2)
                    {
                        game = GameUtils.FlipDiagonal(game, true);
                        isGameChanged = true;
                    }
                    else if (sequenceName == "s17_4_n_17_16" && stone.Y < G.BOARD_SIZE / 2)
                    {
                        game = GameUtils.Flip(game, true);
                        isGameChanged = true;
                    }
                }

                if (isGameChanged)
                {
                    oldGame.ToStart();
                    game.ToStart();
                    int overwriteCount = 0;
                    while (oldGame.ToNextMove() && game.ToNextMove())
                    {
                        GoMoveNode? oldMove = oldGame.Game.CurrentNode as GoMoveNode;
                        if (oldMove != null)
                        {
                            GoMoveNode? move = game.Game.CurrentNode as GoMoveNode;
                            move.Stone.X = oldMove.Stone.X;
                            move.Stone.Y = oldMove.Stone.Y;

                            overwriteCount++;
                            if (overwriteCount == 4) break;
                        }
                    }
                }
            }

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

        Stone? GetStone(GameWrap game, int moveNumber)
        {
            game.ToStart();

            GoMoveNode? move = null;
            for (int i = 0; i < moveNumber; i++)
            {
                move = GetNextMove(game);
            }

            return move == null ? null : move.Stone;
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
