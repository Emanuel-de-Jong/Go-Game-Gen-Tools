package gotrainer.humanai.kata;

import gotrainer.humanai.Move;
import gotrainer.humanai.MoveSuggestion;
import gotrainer.humanai.Moves;

import java.io.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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

    public synchronized void restart() throws Exception {
        if (process != null) write("quit");
        start();
    }

    public synchronized void setBoardsize(int boardsize) throws Exception {
        write("boardsize " + boardsize);
        clearReader();
    }

    public synchronized void setRuleset(String ruleset) throws Exception {
        write("kata-set-rules " + ruleset);
        clearReader();
    }

    public synchronized void setKomi(float komi) throws Exception {
        write("komi " + komi);
        clearReader();
    }

    public synchronized void setBoard(Moves moves) throws Exception {
        clear();

        for (Move move : moves.moves) {
            play(move.color, move.coord);
        }
    }

    public synchronized List<MoveSuggestion> analyze(String color, int maxVisits, float minVisitsPerc,
                                                     float maxVisitDiffPerc) throws Exception {
//        System.out.println(color + " " + maxVisits + " " + minVisitsPerc + " " + maxVisitDiffPerc);
        if (lastMaxVisits != maxVisits) {
            lastMaxVisits = maxVisits;
            write("kata-set-param maxVisits " + maxVisits);
            clearReader();
        }

        write("kata-genmove_analyze " + color);
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
                suggestion.setMove(color, analysis[i+1]);
            } else if (element.equals("visits")) {
                suggestion.setVisits(analysis[i+1]);
            } else if (element.equals("winrate")) {
                suggestion.setWinrate(analysis[i+1]);
            } else if (element.equals("scoreLead")) {
                suggestion.setScoreLead(analysis[i+1]);
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
                    !filteredSuggestions.get(filteredSuggestions.size() - 1).move.coord.equals("pass") &&
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

    public synchronized MoveSuggestion analyzeMove(String color, String coord) throws Exception {
        int maxVisits = 100;
        if (lastMaxVisits != maxVisits) {
            lastMaxVisits = maxVisits;
            write("kata-set-param maxVisits " + maxVisits);
            clearReader();
        }

        write("kata-genmove_analyze " + color + " allow " + color + " " + coord + " 1");
        reader.readLine(); // Ignore '= '
        String[] analysis = reader.readLine().split(" ");
        clearReader();

        write("undo");
        clearReader();

        MoveSuggestion suggestion = new MoveSuggestion(
                color,
                coord,
                analysis[4],
                analysis[8],
                analysis[14]
        );
        return suggestion;
    }

    public synchronized void play(String color, String coord) throws Exception {
        write("play " + color + " " + coord);
        clearReader();
    }

    public synchronized void sgf() throws Exception {
        write("printsgf");
        String sgfStr = reader.readLine().substring(2);
        clearReader();

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd-MM_HH-mm-ss");
        File sgf = new File("sgfs//" + dtf.format(LocalDateTime.now()) + ".sgf");
        if (sgf.exists()) sgf.delete();

        if (sgf.createNewFile()) {
            FileWriter fileWriter = new FileWriter(sgf);
            fileWriter.write(sgfStr);
            fileWriter.close();
        }
    }

    private void write(String command) throws Exception {
        writer.write(command + "\n");
        writer.flush();
    }

    private void clearReader() throws Exception {
        while (!reader.readLine().equals("")) {}
    }

}
