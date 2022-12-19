using System.Diagnostics;

namespace TempAPI.KataGo
{
    public class KataGoWrapper
    {
        public Process process;
        public StreamReader reader;
        public StreamReader errorReader;
        public StreamWriter writer;

        private int lastMaxVisits = 0;

        private void Start()
        {
            process = new Process();
            process.StartInfo.FileName = "E:\\Coding\\Repos\\Gosuji\\KataGo\\katago.exe";
            process.StartInfo.Arguments = "gtp";
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

        private void Clear()
        {
            Write("clear_board");
            ClearReader();
            Write("clear_cache");
            ClearReader();
        }

        public void Restart()
        {
            //Console.WriteLine("KataGo Restart");

            if (process != null) Write("quit");
            Start();
        }

        public void SetBoardsize(int boardsize)
        {
            //Console.WriteLine("KataGo SetBoardsize");

            Write("boardsize " + boardsize);
            ClearReader();
        }

        public void SetRuleset(string ruleset)
        {
            //Console.WriteLine("KataGo SetRuleset");

            Write("kata-set-rules " + ruleset);
            ClearReader();
        }

        public void SetKomi(float komi)
        {
            //Console.WriteLine("KataGo SetKomi");

            Write("komi " + komi);
            ClearReader();
        }

        public MoveSuggestion AnalyzeMove(string color, string coord)
        {
            //Console.WriteLine("KataGo AnalyzeMove");

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

            MoveSuggestion suggestion = new MoveSuggestion(
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
            //Console.WriteLine("KataGo Analyze");

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

            List<MoveSuggestion> suggestions = new List<MoveSuggestion>();
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
                        filteredSuggestions[filteredSuggestions.Count - 1].move.coord != "pass" &&
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
            //Console.WriteLine("KataGo Play");

            Write("play " + color + " " + coord);
            ClearReader();
        }

        public void SetBoard(Moves moves)
        {
            //Console.WriteLine("KataGo SetBoard");

            Clear();

            foreach (Move move in moves.moves)
            {
                Play(move.color, move.coord);
            }
        }

        public void SGF()
        {
            //Console.WriteLine("KataGo SGF");

            Write("printsgf");
            string sgfStr = Read().Substring(2);
            ClearReader();

            StreamWriter sgfWriter = new(File.Create("SGFs\\" +
                DateTime.Now.ToString("dd-MM_HH-mm-ss") +
                ".sgf"));
            sgfWriter.Write(sgfStr);
            sgfWriter.Close();
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
