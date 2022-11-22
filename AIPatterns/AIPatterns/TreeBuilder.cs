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
                    if (StoneUtils.IsPass(item))
                    {
                        new Comment(game).IncPassCount();
                    }
                    else
                    {
                        new Comment(game).IncNoPassCount();
                    }

                    if (!game.Continue(item.Stone))
                    {
                        game.PlaceStone(item.Stone);
                    }

                    new Comment(game).IncCount();

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
                        new Comment(game).IncCount();

                        game.Game.ToPreviousMove(true);
                    }

                    lastItem = item;
                }
                game.ToStart();
            }

            return game;
        }

        public static void FilterByCount(GoNode node, float maxDiff, int minCount)
        {
            FilterByCountLoop(node, maxDiff, minCount);
        }

        private static void FilterByCountLoop(GoNode node, float maxDiff, int minCount)
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

            int highestCount = Comment.GetCount(childPass);
            foreach (GoMoveNode childMove in childMoves)
            {
                int count = Comment.GetCount(childMove);
                if (highestCount < count)
                {
                    highestCount = count;
                }
            }

            int localMinCount = Math.Max(minCount, (int)Math.Round(highestCount * maxDiff));

            Comment comment = new(node);

            bool overrulePass = false;
            if (childPass != null)
            {
                bool hasStone = false;
                foreach (GoMoveNode childMove in childMoves)
                {
                    int count = Comment.GetCount(childMove);
                    if (count >= localMinCount || count > comment.PassCount)
                    {
                        hasStone = true;
                        break;
                    }
                }

                if (!hasStone && comment.NoPassCount > comment.PassCount)
                {
                    overrulePass = true;
                }
            }

            bool isParentPass = false;
            GoMoveNode? move = node as GoMoveNode;
            if (move != null && StoneUtils.IsPass(move)) isParentPass = true;

            foreach (GoMoveNode childMove in childMoves)
            {
                int count = Comment.GetCount(childMove);
                if (count >= localMinCount) continue;

                bool removeChild = false;
                if (isParentPass)
                {
                    removeChild = true;
                } else if (!overrulePass && count <= comment.PassCount)
                {
                    removeChild = true;
                } else
                {
                    foreach (GoMoveNode childMove2 in childMoves)
                    {
                        int count2 = Comment.GetCount(childMove2);
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
                FilterByCountLoop(childNode, maxDiff, minCount);
            }
        }

        public static void AddMarkup(GameWrap game)
        {
            game.ToStart();
            AddMarkupLoop(game.Game.RootNode);
        }

        private static void AddMarkupLoop(GoNode node)
        {
            Comment comment = new(node);
            node.Comment = "Count: " + comment.Count +
                "\nNo pass: " + comment.NoPassCount;

            List<KeyValuePair<GoMoveNode, Comment>> moveCounts = new();
            foreach (GoNode childNode in node.ChildNodes)
            {
                GoMoveNode? move = childNode as GoMoveNode;
                if (move != null)
                {
                    moveCounts.Add(new KeyValuePair<GoMoveNode, Comment>(move, new Comment(move)));
                }
            }

            moveCounts.Sort((pair1, pair2) => pair1.Value.Count.CompareTo(pair2.Value.Count) * -1);

            node.EnsureMarkup();

            for (int i=0; i<moveCounts.Count; i++)
            {
                GoMoveNode move = moveCounts[i].Key;

                node.RemoveNode(move);
                node.ChildNodes.Insert(i, move);

                string grade = ((char)(65 + i)).ToString();

                node.Comment += "\n" + grade + ": " + moveCounts[i].Value.Count;

                if (StoneUtils.IsPass(move))
                {
                    node.Comment += " Pass";
                } else
                {
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
