using IGOEnchi.GoGameLogic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AIPatterns
{
    internal class SequenceGenerator
    {
        const int COUNT_RANGE_Y = 10;
        const int COUNT_RANGE_X = G.BOARD_SIZE_INDEX - COUNT_RANGE_Y;

        const int SECOND_STONE_RANGE_Y = 7;
        const int SECOND_STONE_RANGE_X = G.BOARD_SIZE_INDEX - SECOND_STONE_RANGE_Y;

        SequenceList sequenceList = new();

        public SequenceList Generate(string path)
        {
            sequenceList = new SequenceList();

            string[] sgfPaths = Directory.GetFiles(path, "*.sgf");
            foreach (string sgfPath in sgfPaths)
            {
                GameWrap game = GameUtils.OpenFile(sgfPath);
                AddSequencesFromGame(game);

                //break;
            }

            //foreach (Sequence sequence in sequenceList)
            //{
            //    sequence.PrintBoard();
            //}

            return sequenceList;
        }

        void AddSequencesFromGame(GameWrap game)
        {
            for (int i = 0; i < 4; i++)
            {
                AddSequenceFromGame(game);
                if (i < 4)
                {
                    game = GameUtils.Rotate(game);
                }
            }
        }

        void AddSequenceFromGame(GameWrap game)
        {
            // Check if first stone exists and is black
            game.ToStart();
            Stone? stone = GetNextStoneInRange(game);
            if (stone == null) return;
            bool isFirstStoneBlack = stone.IsBlack;

            // Check if second stone exists and is in range
            stone = GetNextStoneInRange(game);
            if (stone == null) return;
            if (!IsStoneInRange(stone, SECOND_STONE_RANGE_X, SECOND_STONE_RANGE_Y)) return;

            // Swap all stone colors if first stone not black
            if (!isFirstStoneBlack)
            {
                game.ToStart();
                while (game.ToNextMove())
                {
                    GoMoveNode? move = game.Game.CurrentNode as GoMoveNode;
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
                stone = GetNextStoneInRange(game);
                if (stone == null) return;

            } while (G.BOARD_SIZE_INDEX - stone.X == stone.Y);

            // Flip board if stone on wrong side
            if (G.BOARD_SIZE_INDEX - stone.X > stone.Y)
            {
                game = GameUtils.Rotate(game);
                game = GameUtils.Flip(game, false);
            }

            List<Stone> allStones = new();
            Sequence sequence = new();

            // Add first stone
            game.ToStart();
            stone = GetNextStoneInRange(game, allStones);
            sequence.Add(stone, allStones);

            // Add second stone
            stone = GetNextStoneInRange(game, allStones);
            if (stone.IsBlack)
            {
                sequence.Add(new Stone(20, 20, true), allStones);
            }
            sequence.Add(stone, allStones);

            // Add other stones
            bool moveOutOfRange = false;
            bool lastColorBlack = stone.IsBlack;
            while (game.ToNextMove())
            {
                GoMoveNode? move = game.Game.CurrentNode as GoMoveNode;
                if (move != null)
                {
                    stone = move.Stone;
                    if (IsStoneInRange(move.Stone))
                    {
                        if (moveOutOfRange)
                        {
                            sequence.Add(new Stone(20, 20, !lastColorBlack), allStones);

                            if (stone.IsBlack != lastColorBlack)
                            {
                                sequence.Add(new Stone(20, 20, lastColorBlack), allStones);
                            }
                        }

                        sequence.Add(stone, allStones);

                        moveOutOfRange = false;
                        lastColorBlack = stone.IsBlack;
                    } else
                    {
                        if (stone.X != 20)
                        {
                            allStones.Add(stone);
                        }

                        moveOutOfRange = true;
                    }
                }
            }

            sequenceList.Add(sequence);
        }

        Stone? GetNextStoneInRange(GameWrap game)
        {
            return GetNextStoneInRange(game, null);
        }

        Stone? GetNextStoneInRange(GameWrap game, List<Stone>? allStones)
        {
            while (game.ToNextMove())
            {
                GoMoveNode? move = game.Game.CurrentNode as GoMoveNode;
                if (move != null)
                {
                    Stone stone = move.Stone;
                    if (IsStoneInRange(stone))
                    {
                        return stone;
                    }
                    else if (allStones != null && stone.X != 20)
                    {
                        allStones.Add(stone);
                    }
                }
            }

            return null;
        }

        bool IsStoneInRange(Stone stone, int rangeX = COUNT_RANGE_X, int rangeY = COUNT_RANGE_Y)
        {
            if (stone.X >= rangeX && stone.Y <= rangeY)
            {
                return true;
            }
            return false;
        }
    }
}
