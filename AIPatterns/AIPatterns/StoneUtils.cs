using IGOEnchi.GoGameLogic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AIPatterns
{
    internal class StoneUtils
    {
        public static bool IsPass(Stone stone)
        {
            return stone.X == 20;
        }

        public static bool IsPass(GoMoveNode move)
        {
            return IsPass(move.Stone);
        }

        public static bool IsPass(SequenceItem sequenceItem)
        {
            return IsPass(sequenceItem.Stone);
        }

        public static int GetMoveDepth(GoMoveNode move)
        {
            return GetMoveDepthLoop(move, 0);
        }

        private static int GetMoveDepthLoop(GoMoveNode move, int currentDepth)
        {
            currentDepth++;

            int maxChildDepth = currentDepth;
            foreach (GoNode childNode in move.ChildNodes)
            {
                GoMoveNode? childMove = childNode as GoMoveNode;
                if (childMove == null) continue;
                if (StoneUtils.IsPass(childMove)) continue;

                int childDepth = GetMoveDepthLoop(childMove, currentDepth);
                if (childDepth > maxChildDepth)
                {
                    maxChildDepth = childDepth;
                }
            }

            return maxChildDepth;
        }

        public static void Print(Stone stone)
        {
            Console.WriteLine(stone.X + ", " + stone.Y + ": " + (stone.IsBlack ? "B" : "W"));
        }
    }
}
