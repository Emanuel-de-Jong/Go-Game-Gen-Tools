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

        public SequenceList Generate(Dictionary<string, EState> paths)
        {
            sequenceList = new SequenceList();

            foreach (KeyValuePair<string, EState> entry in paths)
            {
                string[] sgfPaths = Directory.GetFiles(entry.Key, "*.sgf", SearchOption.AllDirectories);
                foreach (string sgfPath in sgfPaths)
                {
                    GameWrap game = GameUtils.OpenFile(sgfPath);
                    AddSequenceFromGame(game, entry.Value);
                }
            }

            //foreach (Sequence sequence in sequenceList)
            //{
            //    sequence.PrintBoard();
            //}

            return sequenceList;
        }

        void AddSequenceFromGame(GameWrap game, EState state)
        {
            Sequence sequence = new(game, state);

            game.ToStart();

            GoMoveNode? prevMove;
            GoMoveNode? move;
            switch (state)
            {
                case EState.B:
                    for (int i = 0; i < 1; i++) game.ToNextMove();
                    prevMove = GetNextMove(game);
                    move = GetNextMove(game);

                    if (prevMove.Stone.Y == 4 && move.Stone.Y > 4)
                    {
                        game = GameUtils.Flip(game, true);
                    }
                    else if (G.BOARD_SIZE_INDEX -  prevMove.Stone.X == prevMove.Stone.Y &&
                        G.BOARD_SIZE_INDEX - move.Stone.X > move.Stone.Y)
                    {
                        game = GameUtils.Rotate(game);
                        game = GameUtils.Flip(game, false);
                    }
                    break;

                case EState.W:
                    prevMove = GetNextMove(game);
                    move = GetNextMove(game);

                    if (prevMove.Stone.X == 4 && prevMove.Stone.Y == 4)
                    {
                        if (move.Stone.Y > 4)
                        {
                            game = GameUtils.Flip(game, true);
                            GetNextMove(game);
                            move = GetNextMove(game);
                        }

                        if (move.Stone.X < 4)
                        {
                            game = GameUtils.Flip(game, false);
                            GetNextMove(game);
                            move = GetNextMove(game);
                        }

                        if (G.BOARD_SIZE_INDEX - move.Stone.X > move.Stone.Y)
                        {
                            game = GameUtils.Rotate(game);
                            game = GameUtils.Flip(game, false);
                        }
                    }
                    else if (prevMove.Stone.Y == 4 && move.Stone.Y > 4)
                    {
                        game = GameUtils.Flip(game, true);
                    }
                    else if (G.BOARD_SIZE_INDEX - prevMove.Stone.X == prevMove.Stone.Y &&
                        G.BOARD_SIZE_INDEX - move.Stone.X > move.Stone.Y)
                    {
                        game = GameUtils.Rotate(game);
                        game = GameUtils.Flip(game, false);
                    }
                    break;

                case EState.BH:
                    GetNextMove(game);

                    if (sequence.Handicap == 2)
                    {
                        prevMove = GetNextMove(game);
                        move = GetNextMove(game);
                        if (G.BOARD_SIZE_INDEX - prevMove.Stone.X == prevMove.Stone.Y &&
                            G.BOARD_SIZE_INDEX - move.Stone.X > move.Stone.Y)
                        {
                            game = GameUtils.Rotate(game);
                            game = GameUtils.Flip(game, false);
                        }

                        if (prevMove.Stone.X == prevMove.Stone.Y &&
                            move.Stone.X < move.Stone.Y)
                        {
                            game = GameUtils.Rotate(game);
                            game = GameUtils.Flip(game, true);
                        }
                    }
                    else if (sequence.Handicap == 3)
                    {
                        prevMove = GetNextMove(game);
                        move = GetNextMove(game);
                        if (prevMove.Stone.X == prevMove.Stone.Y &&
                            move.Stone.X < move.Stone.Y)
                        {
                            game = GameUtils.Rotate(game);
                            game = GameUtils.Flip(game, true);
                        }
                    }
                    else if (sequence.Handicap == 4)
                    {
                        prevMove = GetNextMove(game);
                        move = GetNextMove(game);
                        if (prevMove.Stone.X == 4 && prevMove.Stone.Y == 4)
                        {
                            if (move.Stone.Y > 4)
                            {
                                game = GameUtils.Flip(game, true);
                                GetNextMove(game);
                                GetNextMove(game);
                                move = GetNextMove(game);
                            }

                            if (move.Stone.X < 4)
                            {
                                game = GameUtils.Flip(game, false);
                                GetNextMove(game);
                                GetNextMove(game);
                                move = GetNextMove(game);
                            }

                            if (G.BOARD_SIZE_INDEX - move.Stone.X > move.Stone.Y)
                            {
                                game = GameUtils.Rotate(game);
                                game = GameUtils.Flip(game, false);
                            }
                        }
                        else if (prevMove.Stone.Y == 4 && move.Stone.Y > 4)
                        {
                            game = GameUtils.Flip(game, true);
                        }
                        else if (G.BOARD_SIZE_INDEX - prevMove.Stone.X == prevMove.Stone.Y &&
                            G.BOARD_SIZE_INDEX - move.Stone.X > move.Stone.Y)
                        {
                            game = GameUtils.Rotate(game);
                            game = GameUtils.Flip(game, false);
                        }
                    }
                    break;

                case EState.WH:
                    if (sequence.Handicap == 4)
                    {
                        GetNextMove(game);
                        GetNextMove(game);
                        prevMove = GetNextMove(game);
                        move = GetNextMove(game);
                        if (prevMove.Stone.Y == 4 && move.Stone.Y > 4)
                        {
                            game = GameUtils.Flip(game, true);
                        }
                    }
                    break;
            }

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

            game.ToStart();
            if (sequence.Handicap != 0) game.ToNextMove();

            while ((move = GetNextMove(game)) != null)
            {
                sequence.Add(move, game);
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
