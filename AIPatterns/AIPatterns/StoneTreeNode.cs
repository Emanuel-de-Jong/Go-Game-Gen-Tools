using IGOEnchi.GoGameLogic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Formats.Asn1.AsnWriter;

namespace AIPatterns
{
    internal class StoneTreeNode
    {
        public List<StoneTreeNode> Children { get; } = new();
        public Stone Stone { get; set; }
        public int Count { get; set; } = 0;
        public bool IsPass { get; set; }

        public StoneTreeNode()
        {
            Stone = new Stone(-1, -1, true);
            IsPass = true;
        }

        public StoneTreeNode(Stone stone)
        {
            this.Stone = stone;
        }

        public void Add(StoneTreeNode child)
        {
            Count++;
            Children.Add(child);
        }

        public bool Contains(Stone stone)
        {
            foreach (var child in Children)
            {
                if (child.Stone.SameAs(stone)) return true;
            }
            return false;
        }

        public StoneTreeNode? Find(Stone stone)
        {
            foreach (var child in Children)
            {
                if (child.Stone.SameAs(stone)) return child;
            }
            return null;
        }
    }
}
