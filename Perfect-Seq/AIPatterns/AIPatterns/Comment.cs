using IGOEnchi.GoGameLogic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AIPatterns
{
    internal class Comment
    {
        public int Count { get; set; }
        public int PassCount { get; set; }
        public int NoPassCount { get; set; }
        public GameWrap? Game { get; set; }
        public GoNode? Node { get; set; }

        public Comment(GameWrap? game)
        {
            Game = game;
            FillFromString(game?.Game.CurrentComment);
        }

        public Comment(GoNode? node)
        {
            Node = node;
            FillFromString(node?.Comment);
        }

        public void FillFromString(string? commentStr)
        {
            if (commentStr == null) return;

            string[] commentSections = commentStr.Split("\n");

            if (commentSections.Length > 0)
            {
                Count = int.Parse(commentSections[0]);
            }

            if (commentSections.Length > 1)
            {
                PassCount = int.Parse(commentSections[1]);
            }

            if (commentSections.Length > 2)
            {
                NoPassCount = int.Parse(commentSections[2]);
            }
        }

        public void IncCount()
        {
            Count++;
            Apply();
        }

        public void IncPassCount()
        {
            PassCount++;
            Apply();
        }

        public void IncNoPassCount()
        {
            NoPassCount++;
            Apply();
        }

        public void Apply()
        {
            if (Game != null) Apply(Game); else Apply(Node);
        }

        public void Apply(GameWrap? game)
        {
            game?.CommentNode(ToString());
        }

        public void Apply(GoNode? node)
        {
            node.Comment = ToString();
        }

        public override string ToString()
        {
            return Count +
                "\n" + PassCount +
                "\n" + NoPassCount;
        }

        public static int GetCount(GameWrap game)
        {
            return new Comment(game).Count;
        }

        public static int GetCount(GoNode node)
        {
            return new Comment(node).Count;
        }
    }
}
