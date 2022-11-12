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
        public static StoneTreeNode SequenceListToStoneTree(SequenceList sequenceList)
        {
            StoneTreeNode root = new();

            foreach (Sequence sequence in sequenceList)
            {
                StoneTreeNode currentNode = root;

                foreach (Stone stone in sequence)
                {
                    StoneTreeNode? childNode = currentNode.Find(stone);
                    if (childNode == null)
                    {
                        childNode = new StoneTreeNode(stone);
                        currentNode.Add(childNode);
                    }

                    currentNode = childNode;
                }
            }

            return root;
        }

        public static GameWrap SequenceListToGame(SequenceList sequenceList)
        {
            GameWrap game = new();

            foreach (Sequence sequence in sequenceList)
            {
                foreach (Stone stone in sequence)
                {
                    if (!game.Continue(stone))
                    {
                        game.PlaceStone(stone);
                    }

                    string countStr = game.Game.CurrentComment;
                    int.TryParse(countStr, out int count);

                    count++;
                    game.CommentCount(count);
                }
                game.ToStart();
            }

            return game;
        }

        public static void AddMarkup(GameWrap game)
        {
            game.ToStart();
            AddMarkup(game.Game.RootNode);
        }

        private static void AddMarkup(GoNode node)
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
            for (int i=0; i<moveCounts.Count; i++)
            {
                GoMoveNode move = moveCounts[i].Key;
                string text = ((char)(65 + i)).ToString();
                node.Markup.Labels.Add(new TextLabel(move.Stone.X, move.Stone.Y, text));
            }

            foreach (GoNode childNode in node.ChildNodes)
            {
                AddMarkup(childNode);
            }
        }
    }
}
