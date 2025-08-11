using IGOEnchi.GoGameLogic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AIPatterns
{
    public class NodeUtils
    {
        public static int GetDepth(GoNode node)
        {
            int depth = 0;
            while ((node = node.ParentNode) != null)
            {
                depth++;
            }
            return depth;
        }
    }
}
