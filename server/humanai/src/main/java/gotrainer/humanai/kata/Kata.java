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

    private int lastMaxVisits = 0;

    public Kata() throws Exception {}

    private void start() throws Exception {
        ProcessBuilder processBuilder = new ProcessBuilder("katago\\katago.exe", "gtp");
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

    public void restart() throws Exception {
        if (process != null) write("quit");
        start();
    }

    public void setBoardsize(int boardsize) throws Exception {
        write("boardsize " + boardsize);
        clearReader();
    }

    public void setRuleset(String ruleset) throws Exception {
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

    public List<MoveSuggestion> analyze(String color, int moveOptions, int maxVisits, int minVisitsPerc, int maxVisitDiffPerc) throws Exception {
        if (lastMaxVisits != maxVisits) {
            lastMaxVisits = maxVisits;
            write("kata-set-param maxVisits " + maxVisits);
            clearReader();
        }

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
            if (element.equals("move")) {
                suggestion.move = new Move(color, analysis[i+1]);
            } else if (element.equals("visits")) {
                suggestion.visits = Integer.parseInt(analysis[i+1]);
            } else if (element.equals("winrate")) {
                suggestion.winrate = Math.round(Float.parseFloat(analysis[i+1]) * 10000) / 100f;
            } else if (element.equals("scoreLead")) {
                suggestion.scoreLead = Math.round(Float.parseFloat(analysis[i+1]) * 10) / 10f;
            }

            if (element.equals("info") || i == analysis.length - 1) {
                if (suggestion != null) {
                    suggestions.add(suggestion);
                }
                suggestion = new MoveSuggestion();
            }
        }

//        for (MoveSuggestion moveSuggestion : suggestions) {
//            System.out.println(moveSuggestion.move.coord + " " + moveSuggestion.visits);
//        }
//        System.out.println(" ");

        int highestVisits = 0;
        for (MoveSuggestion moveSuggestion : suggestions) {
            if (highestVisits < moveSuggestion.visits) {
                highestVisits = moveSuggestion.visits;
            }
        }
        int maxVisitDiff = (int) Math.round((maxVisitDiffPerc / 100.0) * Math.max(maxVisits, highestVisits));
        int minVisits = (int) Math.round((minVisitsPerc / 100.0) * maxVisits);

        List<MoveSuggestion> filteredSuggestions = new ArrayList<>();
        int lastSuggestionVisits = Integer.MAX_VALUE;
        for (MoveSuggestion moveSuggestion : suggestions) {
            if (filteredSuggestions.size() > 0 &&
                    (moveSuggestion.visits < minVisits ||
                    lastSuggestionVisits - moveSuggestion.visits > maxVisitDiff)) {
                break;
            }
            filteredSuggestions.add(moveSuggestion);
            if (lastSuggestionVisits > moveSuggestion.visits) {
                lastSuggestionVisits = moveSuggestion.visits;
            }
        }

        return filteredSuggestions;
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
