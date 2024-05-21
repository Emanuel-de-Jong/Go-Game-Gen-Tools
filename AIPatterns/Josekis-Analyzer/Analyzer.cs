using IGOEnchi.GoGameLogic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Josekis_Analyzer
{
    class Analyzer
    {
        private static string[] COORD_TO_CHAR =
            ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];

        public static string CalculateSimilarity(GoGame game1, GoGame game2)
        {
            GoNode root1 = game1.RootNode;
            GoNode root2 = game2.RootNode;

            var sequences1 = new List<List<string>>();
            var sequences2 = new List<List<string>>();

            ExtractSequences(root1, new List<string>(), sequences1);
            ExtractSequences(root2, new List<string>(), sequences2);

            var commonSequences = FindCommonSequences(sequences1, sequences2);

            double similarityPercentage = (double)commonSequences.Count / (sequences1.Count + sequences2.Count) * 100;
            var mostCommonSequence = commonSequences
                .GroupBy(seq => string.Join(",", seq))
                .OrderByDescending(g => g.Count())
                .FirstOrDefault()?.Key ?? "None";

            return $"Similarity Percentage: {similarityPercentage:F2}%\n" +
                   $"Most Common Sequence: {mostCommonSequence}\n" +
                   $"Total Common Sequences: {commonSequences.Count}";
        }

        private static void ExtractSequences(GoNode node, List<string> currentSequence, List<List<string>> sequences)
        {
            string? move = GetNodeMove(node);
            if (move == null)
            {
                foreach (var child in node.ChildNodes)
                {
                    ExtractSequences(child, currentSequence, sequences);
                }

                return;
            }

            currentSequence.Add(move);
            if (currentSequence.Count >= 3)
            {
                sequences.Add(new List<string>(currentSequence));
            }

            foreach (var child in node.ChildNodes)
            {
                ExtractSequences(child, currentSequence, sequences);
            }

            currentSequence.RemoveAt(currentSequence.Count - 1);
        }

        private static List<List<string>> FindCommonSequences(List<List<string>> sequences1, List<List<string>> sequences2)
        {
            var commonSequences = new List<List<string>>();
            var sequences2Set = new HashSet<string>(sequences2.Select(seq => string.Join(",", seq)));

            foreach (var seq in sequences1)
            {
                var seqStr = string.Join(",", seq);
                if (sequences2Set.Contains(seqStr))
                {
                    commonSequences.Add(seq);
                }
            }

            return commonSequences;
        }

        private static string? GetNodeMove(GoNode node)
        {
            GoMoveNode? moveNode = node as GoMoveNode;
            if (moveNode == null)
            {
                return null;
            }

            if (moveNode.Stone.X == 20)
            {
                return "Pass";
            }

            string result = COORD_TO_CHAR[moveNode.Stone.X] + (20 - moveNode.Stone.Y);
            return COORD_TO_CHAR[moveNode.Stone.X] + (19 - moveNode.Stone.Y);
        }
    }
}
