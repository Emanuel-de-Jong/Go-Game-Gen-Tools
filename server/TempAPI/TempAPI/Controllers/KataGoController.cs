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
        private static KataGoWrapper kataGo = new();

        private readonly ILogger<KataGoController> _logger;

        public KataGoController(ILogger<KataGoController> logger)
        {
            _logger = logger;
        }

        [HttpGet("clearboard")]
        public void GetClearBoard()
        {
            kataGo.ClearBoard();
        }

        [HttpGet("restart")]
        public void GetRestart()
        {
            kataGo.Restart();
        }

        [HttpGet("setboardsize")]
        public void GetSetBoardsize([RegularExpression(@"(9|13|19)")] string boardsize)
        {
            kataGo.SetBoardsize(int.Parse(boardsize));
        }

        [HttpGet("setruleset")]
        public void GetSetRuleset([RegularExpression(@"(Japanese|Chinese)")] string ruleset)
        {
            kataGo.SetRuleset(ruleset);
        }

        [HttpGet("setkomi")]
        public void GetSetKomi([Range(-150, 150)] float komi)
        {
            kataGo.SetKomi(komi);
        }

        [HttpPost("analyzemove")]
        public MoveSuggestion PostAnalyzeMove([RegularExpression(@"(B|W)")] string color,
            [RegularExpression(@"([A-H]|[J-T])(1[0-9]|[1-9])")] string coord)
        {
            MoveSuggestion output = kataGo.AnalyzeMove(color, coord);
            //MoveSuggestion output = new(color, coord, 200, 0.8f, 1.5f);
            return output;
        }

        [HttpPost("analyze")]
        public List<MoveSuggestion> PostAnalyze([RegularExpression(@"(B|W)")] string color,
            [Range(2, 5000)] int maxVisits,
            [Range(0, 100)] float minVisitsPerc,
            [Range(0, 100)] float maxVisitDiffPerc)
        {
            List<MoveSuggestion> output = kataGo.Analyze(color, maxVisits, minVisitsPerc, maxVisitDiffPerc);
            //List<MoveSuggestion> output = new()
            //{
            //    new MoveSuggestion(color, "A1", 200, 0.8f, 1.5f),
            //    new MoveSuggestion(color, "B2", 200, 0.8f, 1.5f)
            //};
            return output;
        }

        [HttpGet("play")]
        public void GetPlay([RegularExpression(@"(B|W)")] string color,
            [RegularExpression(@"([A-H]|[J-T])(1[0-9]|[1-9])")] string coord)
        {
            kataGo.Play(color, coord);
        }

        [HttpPost("setboard")]
        public void PostSetBoard([FromBody] Moves moves)
        {
            kataGo.SetBoard(moves);
        }

        [HttpGet("sgf")]
        public void GetSGF()
        {
            kataGo.SGF();
        }
    }
}
