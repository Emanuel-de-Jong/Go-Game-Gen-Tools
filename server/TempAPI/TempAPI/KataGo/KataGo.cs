using System.Diagnostics;

namespace TempAPI.KataGo
{
    public class KataGo
    {
        public Process? process;
        public StreamReader? reader;
        public StreamReader? errorReader;
        public StreamWriter? writer;

        private int lastMaxVisits;

        private void Start()
        {
            if (G.Log) Console.WriteLine("KataGo.Start");

            lastMaxVisits = 0;

            process = new Process();
            process.StartInfo.FileName = @"D:\Coding\Repos\GoTrainer-HumanAI\server\TempAPI\TempAPI\Resources\KataGo\katago.exe";
            process.StartInfo.Arguments = @"gtp" +
                @" -model D:\Coding\Repos\GoTrainer-HumanAI\server\TempAPI\TempAPI\Resources\KataGo\kata1-b18c384nbt-s8980552704-d4047449493.bin.gz" +
                @" -config D:\Coding\Repos\GoTrainer-HumanAI\server\TempAPI\TempAPI\Resources\KataGo\default_gtp.cfg";
            process.StartInfo.RedirectStandardOutput = true;
            process.StartInfo.RedirectStandardError = true;
            process.StartInfo.RedirectStandardInput = true;
            process.StartInfo.UseShellExecute = false;
            process.Start();

            reader = process.StandardOutput;
            errorReader = process.StandardError;
            writer = process.StandardInput;

            string line;
            do
            {
                line = ReadError();
                Console.WriteLine(line);
            } while (!line.Contains("GTP ready"));
        }

        public void ClearBoard()
        {
            if (G.Log) Console.WriteLine("KataGo.ClearBoard");

            Write("clear_board");
            ClearReader();
            Write("clear_cache");
            ClearReader();
        }

        public void Restart()
        {
            if (G.Log) Console.WriteLine("KataGo.Restart");

            if (process != null) Write("quit");
            Start();
        }

        public void SetBoardsize(int boardsize)
        {
            if (G.Log) Console.WriteLine("KataGo.SetBoardsize " + boardsize);

            Write("boardsize " + boardsize);
            ClearReader();
        }

        public void SetRuleset(string ruleset)
        {
            if (G.Log) Console.WriteLine("KataGo.SetRuleset " + ruleset);

            Write("kata-set-rules " + ruleset);
            ClearReader();
        }

        public void SetKomi(float komi)
        {
            if (G.Log) Console.WriteLine("KataGo.SetKomi " + komi);

            Write("komi " + komi);
            ClearReader();
        }

        public void SetHandicap(int handicap)
        {
            if (G.Log) Console.WriteLine("KataGo.SetHandicap " + handicap);

            Write("fixed_handicap " + handicap);
            ClearReader();
        }

        public MoveSuggestion AnalyzeMove(string color, string coord)
        {
            if (G.Log) Console.WriteLine("KataGo.AnalyzeMove " + color + " " + coord);

            int maxVisits = 100;
            if (lastMaxVisits != maxVisits)
            {
                lastMaxVisits = maxVisits;
                Write("kata-set-param maxVisits " + maxVisits);
                ClearReader();
            }

            Write("kata-genmove_analyze " + color + " allow " + color + " " + coord + " 1");
            Read(); // Ignore '= '
            string[] analysis = Read().Split(" ");
            ClearReader();

            Write("undo");
            ClearReader();

            MoveSuggestion suggestion = new(
                    color,
                    coord,
                    analysis[4],
                    analysis[8],
                    analysis[14]
            );
            return suggestion;
        }

        public List<MoveSuggestion> Analyze(string color, int maxVisits, float minVisitsPerc, float maxVisitDiffPerc)
        {
            if (G.Log) Console.WriteLine("KataGo.Analyze " + color + " " + maxVisits + " " + minVisitsPerc + " " + maxVisitDiffPerc);

            if (lastMaxVisits != maxVisits)
            {
                lastMaxVisits = maxVisits;
                Write("kata-set-param maxVisits " + maxVisits);
                ClearReader();
            }

            Write("kata-genmove_analyze " + color);
            Read(); // Ignore '= '
            string[] analysis = Read().Split(" ");
            ClearReader();

            Write("undo");
            ClearReader();

            List<MoveSuggestion> suggestions = new();
            MoveSuggestion? suggestion = null;
            for (int i = 0; i < analysis.Length; i++)
            {
                string element = analysis[i];
                if (element == "move")
                {
                    suggestion.SetMove(color, analysis[i + 1]);
                }
                else if (element == "visits")
                {
                    suggestion.SetVisits(analysis[i + 1]);
                }
                else if (element == "winrate")
                {
                    suggestion.SetWinrate(analysis[i + 1]);
                }
                else if (element == "scoreLead")
                {
                    suggestion.SetScoreLead(analysis[i + 1]);
                }

                if (element == "info" || i == analysis.Length - 1)
                {
                    if (suggestion != null)
                    {
                        suggestions.Add(suggestion);
                    }
                    suggestion = new MoveSuggestion();
                }
            }

            int highestVisits = 0;
            foreach (MoveSuggestion moveSuggestion in suggestions)
            {
                if (highestVisits < moveSuggestion.visits)
                {
                    highestVisits = moveSuggestion.visits;
                }
            }
            int maxVisitDiff = (int)Math.Round(maxVisitDiffPerc / 100.0 * Math.Max(maxVisits, highestVisits));
            int minVisits = (int)Math.Round(minVisitsPerc / 100.0 * maxVisits);

            List<MoveSuggestion> filteredSuggestions = new();
            int lastSuggestionVisits = int.MaxValue;
            foreach (MoveSuggestion moveSuggestion in suggestions)
            {
                if (filteredSuggestions.Count > 0 &&
                        filteredSuggestions[^1].move.coord != "pass" &&
                        (moveSuggestion.visits < minVisits ||
                        lastSuggestionVisits - moveSuggestion.visits > maxVisitDiff))
                {
                    break;
                }
                filteredSuggestions.Add(moveSuggestion);
                if (lastSuggestionVisits > moveSuggestion.visits)
                {
                    lastSuggestionVisits = moveSuggestion.visits;
                }
            }

            return filteredSuggestions;
        }

        public void Play(string color, string coord)
        {
            if (G.Log) Console.WriteLine("KataGo.Play " + color + " " + coord);

            Write("play " + color + " " + coord);
            ClearReader();
        }

        public void PlayRange(Moves moves)
        {
            if (G.Log) Console.WriteLine("KataGo.PlayRange " + moves);

            foreach (Move move in moves.moves)
            {
                Play(move.color, move.coord);
            }
        }

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
            if (G.Log) Console.WriteLine("KataGo.SGF");

            Write("printsgf");
            string sgfStr = Read()[2..];
            ClearReader();

            StreamWriter sgfWriter = new(File.Create(
                @"D:\Other\Mega\MEGAsync\Go\SGF\AI-Training-Data\GoTrainer-HumanAI-joseki\kata1-b18c384nbt-s8980552704-d4047449493\" +
                DateTime.Now.ToString("dd-MM_HH-mm-ss") +
                "_" + visits +
                "_" + moves +
                "_" + onlyCommonCornersPerc +
                "_" + cornerChance44 + "-" + cornerChance34 + "-" + cornerChance33 + "-" + cornerChance45 + "-" + cornerChance35 +
                "_0.4" +
                ".sgf"));
            sgfWriter.Write(sgfStr);
            sgfWriter.Close();

            return sgfStr;
        }

        private string Read()
        {
            string line;
            while ((line = reader.ReadLine()) == null) { }
            return line;
        }

        private string ReadError()
        {
            string line;
            while ((line = errorReader.ReadLine()) == null) { }
            return line;
        }

        private void ClearReader()
        {
            while (reader.ReadLine() != "") { }
        }

        private void Write(string command)
        {
            writer.WriteLine(command);
            writer.Flush();
        }
    }
}
