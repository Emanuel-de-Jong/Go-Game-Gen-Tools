package gotrainer.humanai.kata;

import gotrainer.humanai.Move;
import gotrainer.humanai.Moves;

import java.io.*;
import java.util.ArrayList;
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

    public void setKomi(int komi) throws Exception {
        write("komi " + komi);
        clearReader();
    }

    public void setBoard(Moves moves) throws Exception {
        clear();

        for (Move move : moves.moves) {
            play(move.color, move.coord);
        }
    }

    public List<String> analyze(String color, int moveOptions, int strength) throws Exception {
        write("kata-genmove_analyze " + color + " minmoves " + moveOptions + " maxmoves " + moveOptions);
        reader.readLine(); // Ignore '= '
        String[] analysis = reader.readLine().split(" ");
        clearReader();

        write("undo");
        clearReader();

        List<String> moveSuggestions = new ArrayList<>();
        for (int i=0; i<analysis.length; i++) {
            if (analysis[i].equals("move")) {
                moveSuggestions.add(analysis[i+1]);
            }
        }
        return moveSuggestions;
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
