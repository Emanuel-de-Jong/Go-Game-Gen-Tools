using IGOEnchi.GoGameLogic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AIPatterns
{
    internal class PatternFinder
    {
        StoneTreeNode stoneTree;
        StoneTreeNode currentNode;

        public PatternFinder(StoneTreeNode stoneTree)
        {
            this.stoneTree = stoneTree;
            currentNode = stoneTree;
        }

        public void Search(Stone stone)
        {

        }
    }
}
