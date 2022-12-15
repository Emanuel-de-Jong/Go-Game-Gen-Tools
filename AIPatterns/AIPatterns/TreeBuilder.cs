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
        public static GameWrap SequenceListToGame(SequenceList sequenceList, bool combineIdenticalSequences, EState state)
        {
            GameWrap game = new();

            GoNode rootNode = game.Game.RootNode;

            GoSetupNode[] handicapSetupNodes = new GoSetupNode[5];

            handicapSetupNodes[0] = new(game.Game.RootNode);
            handicapSetupNodes[0].Comment = state.ToString();
            rootNode.AddNode(handicapSetupNodes[0]);

            handicapSetupNodes[2] = new(game.Game.RootNode);
            handicapSetupNodes[2].Comment = state == EState.B ? EState.BH.ToString() : EState.WH.ToString();
            handicapSetupNodes[2].AddStone(new Stone(6, 2, true));
            handicapSetupNodes[2].AddStone(new Stone(2, 6, true));
            rootNode.AddNode(handicapSetupNodes[2]);

            handicapSetupNodes[3] = new(game.Game.RootNode);
            handicapSetupNodes[3].Comment = state == EState.B ? EState.BH.ToString() : EState.WH.ToString();
            handicapSetupNodes[3].AddStone(new Stone(2, 2, true));
            handicapSetupNodes[3].AddStone(new Stone(6, 2, true));
            handicapSetupNodes[3].AddStone(new Stone(2, 6, true));
            rootNode.AddNode(handicapSetupNodes[3]);

            handicapSetupNodes[4] = new(game.Game.RootNode);
            handicapSetupNodes[4].Comment = state == EState.B ? EState.BH.ToString() : EState.WH.ToString();
            handicapSetupNodes[4].AddStone(new Stone(2, 2, true));
            handicapSetupNodes[4].AddStone(new Stone(6, 2, true));
            handicapSetupNodes[4].AddStone(new Stone(2, 6, true));
            handicapSetupNodes[4].AddStone(new Stone(6, 6, true));
            rootNode.AddNode(handicapSetupNodes[4]);

            foreach (Sequence sequence in sequenceList)
            {
                game.Game.ToMove(handicapSetupNodes[sequence.Handicap]);

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

        public static void KeepHighestCount(GoNode node, EState state)
        {
            KeepHighestCountLoop(node, state);
        }

        public static void KeepHighestCountLoop(GoNode node, EState state)
        {
            bool isRightColor = false;
            List<GoMoveNode> childMoves = new();
            foreach (GoNode childNode in node.ChildNodes)
            {
                GoMoveNode? childMove = childNode as GoMoveNode;
                if (childMove != null)
                {
                    if (childMove.Stone.IsBlack == (state == EState.B))
                    {
                        isRightColor = true;
                    } else
                    {
                        break;
                    }

                    childMoves.Add(childMove);
                }
            }

            if (isRightColor)
            {
                int highestCount = 0;
                GoMoveNode highestNode = null;
                foreach (GoMoveNode childMove in childMoves)
                {
                    int count = Comment.GetCount(childMove);
                    if (highestCount < count)
                    {
                        highestCount = count;
                        highestNode = childMove;
                    }
                }

                foreach (GoMoveNode childMove in childMoves)
                {
                    if (childMove != highestNode)
                    {
                        node.RemoveNode(childMove);
                    }
                }
            }

            foreach (GoNode childNode in node.ChildNodes)
            {
                KeepHighestCountLoop(childNode, state);
            }
        }

        public static void FilterByCount(GoNode node, float maxDiff, int minCount)
        {
            FilterByCountLoop(node, maxDiff, minCount);
        }

        private static void FilterByCountLoop(GoNode node, float maxDiff, int minCount)
        {
            List<GoMoveNode> childMoves = new();
            foreach (GoNode childNode in node.ChildNodes)
            {
                GoMoveNode? childMove = childNode as GoMoveNode;
                if (childMove != null)
                {
                    childMoves.Add(childMove);
                }
            }

            foreach (GoMoveNode childMove in childMoves)
            {
                int count = Comment.GetCount(childMove);
                if (count >= minCount) continue;

                bool removeChild = false;
                foreach (GoMoveNode childMove2 in childMoves)
                {
                    int count2 = Comment.GetCount(childMove2);
                    if (count < count2)
                    {
                        removeChild = true;
                        break;
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
            node.Comment = "Count: " + comment.Count;

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

            int index = -1;
            for (int i=0; i<moveCounts.Count; i++)
            {
                var moveCount = moveCounts[i];
                index++;

                GoMoveNode move = moveCount.Key;

                node.RemoveNode(move);
                node.ChildNodes.Insert(i, move);

                string grade = ((char)(65 + index)).ToString();

                node.Comment += "\n" + grade + ": " + moveCount.Value.Count;

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
