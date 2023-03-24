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
        private static KataGo.KataGo KataGo = new();

        private readonly ILogger<RCKataGoWrapper> _logger;

        public RCKataGoWrapper(ILogger<RCKataGoWrapper> logger)
        {
            _logger = logger;
        }

        [HttpGet("clearboard")]
        public void GetClearBoard()
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.ClearBoard");

            KataGo.ClearBoard();
        }

        [HttpGet("restart")]
        public void GetRestart()
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.Restart");

            KataGo.Restart();
        }

        [HttpGet("setboardsize")]
        public void GetSetBoardsize([RegularExpression(@"(9|13|19)")] string boardsize)
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.SetBoardsize " + boardsize);

            KataGo.SetBoardsize(int.Parse(boardsize));
        }

        [HttpGet("setruleset")]
        public void GetSetRuleset([RegularExpression(@"(Japanese|Chinese)")] string ruleset)
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.SetRuleset " + ruleset);

            KataGo.SetRuleset(ruleset);
        }

        [HttpGet("setkomi")]
        public void GetSetKomi([Range(-150, 150)] float komi)
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.SetKomi " + komi);

            KataGo.SetKomi(komi);
        }

        [HttpGet("sethandicap")]
        public void GetSetHandicap([Range(2, 9)] int handicap)
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.SetHandicap " + handicap);

            KataGo.SetHandicap(handicap);
        }

        [HttpPost("analyzemove")]
        public MoveSuggestion PostAnalyzeMove([RegularExpression(@"(B|W)")] string color,
            [RegularExpression(@"([A-H]|[J-T])(1[0-9]|[1-9])")] string coord)
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.AnalyzeMove " + color + " " + coord);

            MoveSuggestion output = KataGo.AnalyzeMove(color, coord);
            //MoveSuggestion output = new(color, coord, 200, 0.8f, 1.5f);
            return output;
        }

        [HttpPost("analyze")]
        public List<MoveSuggestion> PostAnalyze([RegularExpression(@"(B|W)")] string color,
            [Range(2, 5000)] int maxVisits,
            [Range(0, 100)] float minVisitsPerc,
            [Range(0, 100)] float maxVisitDiffPerc)
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.Analyze " + color + " " + maxVisits + " " + minVisitsPerc + " " + maxVisitDiffPerc);

            List<MoveSuggestion> output = KataGo.Analyze(color, maxVisits, minVisitsPerc, maxVisitDiffPerc);
            //List<MoveSuggestion> output = new()
            //{
            //    new MoveSuggestion(color, "A1", 200, 80_000_000, 15_000_000),
            //    new MoveSuggestion(color, "B2", 200, 80_000_000, 15_000_000)
            //};
            return output;
        }

        [HttpGet("play")]
        public void GetPlay([RegularExpression(@"(B|W)")] string color,
            [RegularExpression(@"([A-H]|[J-T])(1[0-9]|[1-9])")] string coord)
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.Play " + color + " " + coord);

            KataGo.Play(color, coord);
        }

        [HttpPost("playrange")]
        public void PostPlayRange(Moves moves)
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.PlayRange " + moves);

            KataGo.PlayRange(moves);
        }

        [HttpGet("sgf")]
        public string GetSGF(bool shouldWriteFile)
        {
            if (G.Log) Console.WriteLine("RCKataGoWrapper.SGF " + shouldWriteFile);

            return KataGo.SGF(shouldWriteFile);
        }
    }
}
