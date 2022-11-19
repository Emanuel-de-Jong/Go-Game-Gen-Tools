using IGOEnchi.GoGameLogic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace AIPatterns
{
    internal class TreeBuilder
    {
        public static GameWrap SequenceListToGame(SequenceList sequenceList, bool combineIdenticalSequences)
        {
            GameWrap game = new();

            foreach (Sequence sequence in sequenceList)
            {
                SequenceItem lastItem = null;
                foreach (SequenceItem item in sequence)
                {
                    if (!game.Continue(item.Stone))
                    {
                        game.PlaceStone(item.Stone);
                    }

                    IncrementCount(game);

                    GoNode node = game.Game.CurrentNode;
                    node.EnsureMarkup();
                    node.Markup.Marks.Clear();
                    for (int y=0; y<G.BOARD_SIZE; y++)
                    {
                        for (int x=0; x< G.BOARD_SIZE; x++)
                        {
                            if (item.BlackAndWhite[x, y])
                            {
                                Stone stone = new(x, y, item.Black[x, y]);
                                if (game.Game.board.BlackAndWhite[x, y]) continue;
                                node.Markup.Marks.Add(new Mark(stone.X, stone.Y, stone.IsBlack ? MarkType.Mark : MarkType.Triangle));
                            }
                        }
                    }

                    if (combineIdenticalSequences &&
                        lastItem != null &&
                        StoneUtils.IsPass(lastItem) &&
                        StoneUtils.IsPass(item))
                    {
                        game.Game.ToPreviousMove(true);
                        IncrementCount(game);

                        game.Game.ToPreviousMove(true);
                    }

                    lastItem = item;
                }
                game.ToStart();
            }

            return game;
        }

        public static void IncrementCount(GameWrap game)
        {
            string countStr = game.Game.CurrentComment;
            int.TryParse(countStr, out int count);

            count++;
            game.CommentCount(count);
        }

        public static void FilterByCount(GoNode node, int minCount)
        {
            FilterByCountLoop(node, minCount);
        }

        private static void FilterByCountLoop(GoNode node, int minCount)
        {
            GoMoveNode childPass = null;
            List<GoMoveNode> childMoves = new();
            foreach (GoNode childNode in node.ChildNodes)
            {
                GoMoveNode? childMove = childNode as GoMoveNode;
                if (childMove != null)
                {
                    if (StoneUtils.IsPass(childMove))
                    {
                        childPass = childMove;
                    } else
                    {
                        childMoves.Add(childMove);
                    }
                }
            }

            bool overrulePass = false;
            int passCount = 0;

            if (childPass != null)
            {
                int.TryParse(childPass.Comment, out passCount);

                int noPassCount = 0;
                bool hasStone = false;
                foreach (GoMoveNode childMove in childMoves)
                {
                    int.TryParse(childMove.Comment, out int count);
                    if (count >= minCount || count > passCount)
                    {
                        hasStone = true;
                        break;
                    }

                    noPassCount += count;
                }

                if (!hasStone && noPassCount > passCount)
                {
                    overrulePass = true;
                }
            }

            bool isParentPass = false;
            GoMoveNode? move = node as GoMoveNode;
            if (move != null && StoneUtils.IsPass(move)) isParentPass = true;

            foreach (GoMoveNode childMove in childMoves)
            {
                int.TryParse(childMove.Comment, out int count);
                if (count >= minCount) continue;

                bool removeChild = false;
                if (isParentPass)
                {
                    removeChild = true;
                } else if (!overrulePass && count <= passCount)
                {
                    removeChild = true;
                } else
                {
                    foreach (GoMoveNode childMove2 in childMoves)
                    {
                        int.TryParse(childMove2.Comment, out int count2);
                        if (count < count2)
                        {
                            removeChild = true;
                            break;
                        }
                    }
                }

                if (removeChild) node.RemoveNode(childMove);
            }

            foreach (GoNode childNode in node.ChildNodes)
            {
                FilterByCountLoop(childNode, minCount);
            }
        }

        public static void AddMarkup(GameWrap game)
        {
            game.ToStart();
            AddMarkupLoop(game.Game.RootNode);
        }

        private static void AddMarkupLoop(GoNode node)
        {
            List<KeyValuePair<GoMoveNode, int>> moveCounts = new();
            foreach (GoNode childNode in node.ChildNodes)
            {
                GoMoveNode? move = childNode as GoMoveNode;
                if (move != null)
                {
                    int.TryParse(move.Comment, out int count);
                    moveCounts.Add(new KeyValuePair<GoMoveNode, int>(move, count));
                }
            }

            moveCounts.Sort((pair1, pair2) => pair1.Value.CompareTo(pair2.Value) * -1);

            node.EnsureMarkup();

            bool isFirstNonPassMove = true;
            for (int i=0; i<moveCounts.Count; i++)
            {
                GoMoveNode move = moveCounts[i].Key;

                node.RemoveNode(move);
                node.ChildNodes.Insert(i, move);

                string grade = ((char)(65 + i)).ToString();

                node.Comment += "\n" + grade + ": " + moveCounts[i].Value;

                if (StoneUtils.IsPass(move))
                {
                    node.Comment += " Pass";
                } else
                {
                    if (isFirstNonPassMove)
                    {
                        isFirstNonPassMove = false;
                        node.GetChild(i);
                    }

                    node.Markup.Labels.Add(new TextLabel(move.Stone.X, move.Stone.Y, grade));
                }
            }

            foreach (GoNode childNode in node.ChildNodes)
            {
                AddMarkupLoop(childNode);
            }
        }

        public static void RemoveRedundentPasses(GameWrap game)
        {
            game.ToStart();
            RemoveRedundentPassesLoop(game.Game.RootNode);
            RemoveRedundentPassesLoop(game.Game.RootNode);
            RemoveRedundentPassesLoop(game.Game.RootNode);
        }

        private static bool RemoveRedundentPassesLoop(GoNode node)
        {
            if (!node.HasChildren)
            {
                GoMoveNode? move = node as GoMoveNode;
                if (move != null && StoneUtils.IsPass(move))
                {
                    return false;
                }
            }

            foreach (GoNode childNode in new List<GoNode>(node.ChildNodes))
            {
                if (!RemoveRedundentPassesLoop(childNode))
                {
                    node.RemoveNode(childNode);
                }
            }

            return true;
        }
    }
}
