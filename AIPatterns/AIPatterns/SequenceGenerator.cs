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
            game.ToStart();

            Stone? stone = GetNextStoneInRange(game);
            if (stone == null) return;
            bool isFirstStoneBlack = stone.IsBlack;

            stone = GetNextStoneInRange(game);
            if (stone == null) return;
            if (!IsStoneInRange(stone, SECOND_STONE_RANGE_X, SECOND_STONE_RANGE_Y)) return;

            game.ToStart();
            bool moveOutOfRange = false;
            bool lastColorBlack = false;
            Sequence sequence = new();

            while (game.ToNextMove())
            {
                GoMoveNode? move = game.Game.CurrentNode as GoMoveNode;
                if (move != null)
                {
                    if (IsStoneInRange(move.Stone))
                    {
                        stone = move.Stone;
                        if (!isFirstStoneBlack) stone.IsBlack = !stone.IsBlack;

                        if (moveOutOfRange)
                        {
                            sequence.Add(new Stone(20, 20, true));

                            if (stone.IsBlack != lastColorBlack)
                            {
                                sequence.Add(new Stone(20, 20, true));
                            }
                        }

                        sequence.Add(stone);

                        moveOutOfRange = false;
                        lastColorBlack = stone.IsBlack;
                    } else
                    {
                        moveOutOfRange = true;
                    }
                }
            }

            sequenceList.Add(sequence);
        }

        Stone? GetNextStoneInRange(GameWrap game)
        {
            while (game.ToNextMove())
            {
                GoMoveNode? move = game.Game.CurrentNode as GoMoveNode;
                if (move != null && IsStoneInRange(move.Stone))
                {
                    return move.Stone;
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
