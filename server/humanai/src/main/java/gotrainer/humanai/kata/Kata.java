package gotrainer.humanai.kata;

import gotrainer.humanai.Move;
import gotrainer.humanai.MoveSuggestion;
import gotrainer.humanai.Moves;

import java.io.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Kata {

    public Process process;
    public BufferedReader reader;
    public BufferedWriter writer;

    public Kata() throws Exception {
        start(1000);
    }

    private void start(int maxVisits) throws Exception {
        ProcessBuilder processBuilder = new ProcessBuilder("katago\\katago.exe", "gtp",
                "-override-config", "maxVisits=" + maxVisits);
        processBuilder.redirectErrorStream(true);
        process = processBuilder.start();

        reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()));

        String line;
        do {
            line = reader.readLine();
            System.out.println(line);
        } while (!line.contains("GTP ready"));
    }

    private void clear() throws Exception {
        write("clear_board");
        clearReader();
        write("clear_cache");
        clearReader();
    }

    public void restart(int maxVisits) throws Exception {
        write("quit");
        start(maxVisits);
    }

    public void setBoardsize(int boardsize) throws Exception {
        write("boardsize " + boardsize);
        clearReader();
    }

    public void setRules(String ruleset) throws Exception {
        write("kata-set-rules " + ruleset);
        clearReader();
    }

    public void setKomi(float komi) throws Exception {
        write("komi " + komi);
        clearReader();
    }

    public void setBoard(Moves moves) throws Exception {
        clear();

        for (Move move : moves.moves) {
            play(move.color, move.coord);
        }
    }

    public List<MoveSuggestion> analyze(String color, int moveOptions, int minimumVisits) throws Exception {
        write("kata-genmove_analyze " + color + " minmoves " + moveOptions + " maxmoves " + moveOptions);
        reader.readLine(); // Ignore '= '
        String[] analysis = reader.readLine().split(" ");
        clearReader();

//        System.out.println(Arrays.toString(analysis));

        write("undo");
        clearReader();

        List<MoveSuggestion> suggestions = new ArrayList<>();
        MoveSuggestion suggestion = null;
        for (int i=0; i<analysis.length; i++) {
            String element = analysis[i];
            if (element.equals("info")) {
                if (suggestion != null) {
                    if (suggestion.visits >= minimumVisits) {
                        suggestions.add(suggestion);
                    }
                }
                suggestion = new MoveSuggestion();
            } else if (element.equals("move")) {
                suggestion.move = new Move(color, analysis[i+1]);
            } else if (element.equals("visits")) {
                suggestion.visits = Integer.parseInt(analysis[i+1]);
            } else if (element.equals("winrate")) {
                suggestion.winrate = Math.round(Float.parseFloat(analysis[i+1]) * 10000) / 100f;
            } else if (element.equals("scoreLead")) {
                suggestion.scoreLead = Math.round(Float.parseFloat(analysis[i+1]) * 10) / 10f;
            }
        }

        return suggestions;
    }

    public void play(String color, String coord) throws Exception {
        write("play " + color + " " + coord);
        clearReader();
    }

    private void write(String command) throws Exception {
        writer.write(command + "\n");
        writer.flush();
    }

    private void clearReader() throws Exception {
        while (!reader.readLine().equals("")) {}
    }

}
