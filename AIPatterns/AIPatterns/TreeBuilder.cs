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
                foreach (KeyValuePair<Stone, List<Stone>> pair in sequence)
                {
                    if (!game.Continue(pair.Key))
                    {
                        game.PlaceStone(pair.Key);
                    }

                    string countStr = game.Game.CurrentComment;
                    int.TryParse(countStr, out int count);

                    count++;
                    game.CommentCount(count);

                    GoNode node = game.Game.CurrentNode;
                    node.EnsureMarkup();
                    node.Markup.Marks.Clear();
                    foreach (Stone stone in pair.Value)
                    {
                        node.Markup.Marks.Add(new Mark(stone.X, stone.Y, stone.IsBlack ? MarkType.Mark : MarkType.Triangle));
                    }
                }
                game.ToStart();
            }

            return game;
        }

        public static void FilterByCount(GameWrap game, int minCount)
        {
            game.ToStart();
            FilterByCount(game.Game.RootNode, minCount);
        }

        private static void FilterByCount(GoNode node, int minCount)
        {
            List<GoNode> nodesToRemove = new List<GoNode>();
            foreach (GoNode childNode in node.ChildNodes)
            {
                GoMoveNode? move = childNode as GoMoveNode;
                if (move != null)
                {
                    int.TryParse(move.Comment, out int count);
                    if (count < minCount)
                    {
                        nodesToRemove.Add(childNode);
                    }
                }
            }

            foreach (GoNode childNode in nodesToRemove)
            {
                node.ChildNodes.Remove(childNode);
            }

            foreach (GoNode childNode in node.ChildNodes)
            {
                FilterByCount(childNode, minCount);
            }
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

                if (move.Stone.X == 20)
                {
                    node.Comment = "Pass: " + text + "\n" + node.Comment;
                } else
                {
                    node.Markup.Labels.Add(new TextLabel(move.Stone.X, move.Stone.Y, text));
                }
            }

            foreach (GoNode childNode in node.ChildNodes)
            {
                AddMarkup(childNode);
            }
        }
    }
}
