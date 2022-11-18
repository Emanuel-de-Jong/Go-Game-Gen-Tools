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
        public static GameWrap SequenceListToGame(SequenceList sequenceList)
        {
            GameWrap game = new();

            foreach (Sequence sequence in sequenceList)
            {
                foreach (SequenceItem item in sequence)
                {
                    if (!game.Continue(item.Stone))
                    {
                        game.PlaceStone(item.Stone);
                    }

                    string countStr = game.Game.CurrentComment;
                    int.TryParse(countStr, out int count);

                    count++;
                    game.CommentCount(count);

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
                }
                game.ToStart();
            }

            return game;
        }

        public static void FilterByCount(GoNode node, int minCount)
        {
            FilterByCountLoop(node, minCount);
        }

        private static void FilterByCountLoop(GoNode node, int minCount)
        {
            GoMoveNode? move = node as GoMoveNode;

            List<GoNode> childNodes = new List<GoNode>(node.ChildNodes);
            foreach (GoNode childNode in childNodes)
            {
                GoMoveNode? childMove = childNode as GoMoveNode;
                if (childMove == null) continue;

                int.TryParse(childMove.Comment, out int count);
                if (count >= minCount) continue;

                bool removeChild = false;
                if (move != null && StoneUtils.IsPass(move.Stone))
                {
                    removeChild = true;
                } else
                {
                    foreach (GoNode childNode2 in childNodes)
                    {
                        GoMoveNode? childMove2 = childNode2 as GoMoveNode;
                        if (childMove2 == null) continue;

                        if (StoneUtils.IsPass(childMove2.Stone))
                        {
                            removeChild = true;
                            break;
                        }

                        int.TryParse(childMove2.Comment, out int count2);
                        if (count2 > count || (count2 == count && StoneUtils.IsPass(childMove2.Stone)))
                        {
                            removeChild = true;
                            break;
                        }
                    }
                }

                if (removeChild) node.RemoveNode(childNode);
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

                if (StoneUtils.IsPass(move.Stone))
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
                if (move != null && StoneUtils.IsPass(move.Stone))
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
