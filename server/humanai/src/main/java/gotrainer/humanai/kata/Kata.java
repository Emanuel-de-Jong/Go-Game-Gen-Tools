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
    public Thread inputThread;

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
        write("version");
    }

    private void clear() throws Exception {
        clearReader();
        write("clear_board");
        clearReader();
        write("clear_cache");
    }

    public void restart(int maxVisits) throws Exception {
        write("quit");
        start(maxVisits);
    }

    public void setBoardsize(int boardsize) throws Exception {
        clearReader();
        write("boardsize " + boardsize);
    }

    public void setRules(String ruleset) throws Exception {
        clearReader();
        write("kata-set-rules " + ruleset);
    }

    public void setKomi(int komi) throws Exception {
        clearReader();
        write("komi " + komi);
    }

    public List<String> analyze(Moves moves, String color, int moveOptions, int strength) throws Exception {
        clear();

        for (Move move : moves.moves) {
            play(move.color, move.coord);
        }

        clearReader();
        write("lz-genmove_analyze " + color + " minmoves " + moveOptions + " maxmoves " + moveOptions);
        reader.readLine(); // Ignore '= '
        String[] analysis = reader.readLine().split(" ");

        List<String> moveSuggestions = new ArrayList<>();
        for (int i=0; i<analysis.length; i++) {
            if (analysis[i].equals("move")) {
                moveSuggestions.add(analysis[i+1]);
            }
        }
        return moveSuggestions;
    }

    public void play(String color, String coord) throws Exception {
        clearReader();
        write("play " + color + " " + coord);
    }

    private void write(String command) throws Exception {
        writer.write(command + "\n");
        writer.flush();
    }

    private void clearReader() throws Exception {
        while (!reader.readLine().equals("")) {}
    }

}
