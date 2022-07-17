package gotrainer.humanai.kata;

import com.fasterxml.jackson.databind.ObjectMapper;
import gotrainer.humanai.Moves;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/kata")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class KataController {

    public Kata kata;

    private ObjectMapper objectMapper = new ObjectMapper();

    public KataController() throws Exception {
        kata = new Kata();
    }

    @GetMapping("/commands")
    public void getCommands() throws Exception {
        System.out.println("commands");
        kata.commands();
    }

    @GetMapping("/restart")
    public void getRestart() throws Exception {
        System.out.println("restart");
        kata.restart();
    }

    @GetMapping("/setboardsize")
    public void getSetBoardsize(@RequestParam int boardsize) throws Exception {
        System.out.println("setboardsize");
        kata.setBoardsize(boardsize);
    }

    @GetMapping("/setrules")
    public void getSetRules(@RequestParam String ruleset) throws Exception {
        System.out.println("setrules");
        kata.setRules(ruleset);
    }

    @GetMapping("/setkomi")
    public void getSetKomi(@RequestParam int komi) throws Exception {
        System.out.println("setkomi");
        kata.setKomi(komi);
    }

    @GetMapping("/genmove")
    public String getGenmove(@RequestParam String color) throws Exception {
        System.out.println("genmove");
        return kata.genmove(color);
    }

    @PostMapping("/analyze")
    public List<String> postAnalyze(@RequestBody String movesJson, @RequestParam String color, @RequestParam int moveOptions,
                                   @RequestParam int strength) throws Exception {
        System.out.println("analyze");
        Moves moves = objectMapper.readValue(movesJson, Moves.class);
        return kata.analyze(moves, color, moveOptions, strength);
    }

    @GetMapping("/play")
    public void getPlay(@RequestParam String color, @RequestParam String coord) throws Exception {
        System.out.println("play");
        kata.play(color, coord);
    }

}
