using Microsoft.AspNetCore.Mvc;
using System.Xml.Linq;
using TempAPI.KataGo;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TempAPI.Controllers
{
    [ApiController]
    [Route("kata")]
    public class RCKataGoWrapper : ControllerBase
    {
        private static KataGo.KataGo kataGo = new();

        private readonly ILogger<RCKataGoWrapper> _logger;

        public RCKataGoWrapper(ILogger<RCKataGoWrapper> logger)
        {
            _logger = logger;
        }

        [HttpGet("clearboard")]
        public void ClearBoard()
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.ClearBoard");

            kataGo.ClearBoard();
        }

        [HttpGet("restart")]
        public void Restart()
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.Restart");

            kataGo.Restart();
        }

        [HttpGet("setboardsize")]
        public void SetBoardsize([RegularExpression(@"(9|13|19)")] string boardsize)
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.SetBoardsize " + boardsize);

            kataGo.SetBoardsize(int.Parse(boardsize));
        }

        [HttpGet("setruleset")]
        public void SetRuleset([RegularExpression(@"(Japanese|Chinese)")] string ruleset)
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.SetRuleset " + ruleset);

            kataGo.SetRuleset(ruleset);
        }

        [HttpGet("setkomi")]
        public void SetKomi([Range(-150, 150)] float komi)
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.SetKomi " + komi);

            kataGo.SetKomi(komi);
        }

        [HttpGet("sethandicap")]
        public void SetHandicap([Range(2, 9)] int handicap)
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.SetHandicap " + handicap);

            kataGo.SetHandicap(handicap);
        }

        [HttpPost("analyzemove")]
        public MoveSuggestion AnalyzeMove([RegularExpression(@"(B|W)")] string color,
            [RegularExpression(@"([A-H]|[J-T])(1[0-9]|[1-9])")] string coord)
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.AnalyzeMove " + color + " " + coord);

            MoveSuggestion output = kataGo.AnalyzeMove(color, coord);
            //MoveSuggestion output = new(color, coord, 200, 0.8f, 1.5f);
            return output;
        }

        [HttpPost("analyze")]
        public List<MoveSuggestion> Analyze([RegularExpression(@"(B|W)")] string color,
            [Range(2, 5000)] int maxVisits,
            [Range(0, 100)] float minVisitsPerc,
            [Range(0, 100)] float maxVisitDiffPerc)
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.Analyze " + color + " " + maxVisits + " " + minVisitsPerc + " " + maxVisitDiffPerc);

            List<MoveSuggestion> output = kataGo.Analyze(color, maxVisits, minVisitsPerc, maxVisitDiffPerc);
            //List<MoveSuggestion> output = new()
            //{
            //    new MoveSuggestion(color, "A1", 200, 80_000_000, 15_000_000),
            //    new MoveSuggestion(color, "B2", 200, 80_000_000, 15_000_000)
            //};
            return output;
        }

        [HttpGet("play")]
        public void Play([RegularExpression(@"(B|W)")] string color,
            [RegularExpression(@"([A-H]|[J-T])(1[0-9]|[1-9])")] string coord)
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.Play " + color + " " + coord);

            kataGo.Play(color, coord);
        }

        [HttpPost("playrange")]
        public void PlayRange(Moves moves)
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.PlayRange " + moves);

            kataGo.PlayRange(moves);
        }

        [HttpGet("sgf")]
        public string SGF(int options,
            int color,
            int visits,
            int moves,
            int minVisitsPerc,
            int onlyCommonCornersPerc,
            int cornerChance44,
            int cornerChance34,
            int cornerChance33,
            int cornerChance45,
            int cornerChance35)
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.SGF");

            return kataGo.SGF(options,
                color,
                visits,
                moves,
                minVisitsPerc,
                onlyCommonCornersPerc,
                cornerChance44,
                cornerChance34,
                cornerChance33,
                cornerChance45,
                cornerChance35);
        }
    }
}
