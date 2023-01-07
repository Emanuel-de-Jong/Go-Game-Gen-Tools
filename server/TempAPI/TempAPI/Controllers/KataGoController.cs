using Microsoft.AspNetCore.Mvc;
using System.Xml.Linq;
using TempAPI.Models;
using TempAPI.KataGo;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TempAPI.Controllers
{
    [ApiController]
    [Route("kata")]
    public class KataGoController : ControllerBase
    {
        private static KataGoWrapper kataGoWrapper = new();

        private readonly ILogger<KataGoController> _logger;

        public KataGoController(ILogger<KataGoController> logger)
        {
            _logger = logger;
        }

        [HttpGet("clearboard")]
        public void GetClearBoard()
        {
            if (G.Log) Console.WriteLine("KataGoController.ClearBoard");

            kataGoWrapper.ClearBoard();
        }

        [HttpGet("restart")]
        public void GetRestart()
        {
            if (G.Log) Console.WriteLine("KataGoController.Restart");

            kataGoWrapper.Restart();
        }

        [HttpGet("setboardsize")]
        public void GetSetBoardsize([RegularExpression(@"(9|13|19)")] string boardsize)
        {
            if (G.Log) Console.WriteLine("KataGoController.SetBoardsize " + boardsize);

            kataGoWrapper.SetBoardsize(int.Parse(boardsize));
        }

        [HttpGet("setruleset")]
        public void GetSetRuleset([RegularExpression(@"(Japanese|Chinese)")] string ruleset)
        {
            if (G.Log) Console.WriteLine("KataGoController.SetRuleset " + ruleset);

            kataGoWrapper.SetRuleset(ruleset);
        }

        [HttpGet("setkomi")]
        public void GetSetKomi([Range(-150, 150)] float komi)
        {
            if (G.Log) Console.WriteLine("KataGoController.SetKomi " + komi);

            kataGoWrapper.SetKomi(komi);
        }

        [HttpGet("sethandicap")]
        public void GetSetHandicap([Range(2, 9)] int handicap)
        {
            if (G.Log) Console.WriteLine("KataGoController.SetHandicap " + handicap);

            kataGoWrapper.SetHandicap(handicap);
        }

        [HttpPost("analyzemove")]
        public MoveSuggestion PostAnalyzeMove([RegularExpression(@"(B|W)")] string color,
            [RegularExpression(@"([A-H]|[J-T])(1[0-9]|[1-9])")] string coord)
        {
            if (G.Log) Console.WriteLine("KataGoController.AnalyzeMove " + color + " " + coord);

            MoveSuggestion output = kataGoWrapper.AnalyzeMove(color, coord);
            //MoveSuggestion output = new(color, coord, 200, 0.8f, 1.5f);
            return output;
        }

        [HttpPost("analyze")]
        public List<MoveSuggestion> PostAnalyze([RegularExpression(@"(B|W)")] string color,
            [Range(2, 5000)] int maxVisits,
            [Range(0, 100)] float minVisitsPerc,
            [Range(0, 100)] float maxVisitDiffPerc)
        {
            if (G.Log) Console.WriteLine("KataGoController.Analyze " + color + " " + maxVisits + " " + minVisitsPerc + " " + maxVisitDiffPerc);

            List<MoveSuggestion> output = kataGoWrapper.Analyze(color, maxVisits, minVisitsPerc, maxVisitDiffPerc);
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
            if (G.Log) Console.WriteLine("KataGoController.Play " + color + " " + coord);

            kataGoWrapper.Play(color, coord);
        }

        [HttpPost("playrange")]
        public void PostPlayRange(Moves moves)
        {
            if (G.Log) Console.WriteLine("KataGoController.PlayRange " + moves);

            kataGoWrapper.PlayRange(moves);
        }

        [HttpGet("sgf")]
        public string GetSGF(bool shouldWriteFile)
        {
            if (G.Log) Console.WriteLine("KataGoController.SGF " + shouldWriteFile);

            return kataGoWrapper.SGF(shouldWriteFile);
        }
    }
}
