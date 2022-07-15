package gotrainer.humanai.kata;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/kata")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class KataController {

    public Kata kata;

    public KataController() throws Exception {
        kata = new Kata();
    }

    @GetMapping("/commands")
    public void getCommands() throws Exception {
        kata.commands();
    }

    @GetMapping("/genmove")
    public String getGenmove(@RequestParam String color) throws Exception {
        return kata.genmove(color);
    }

    @GetMapping("/analyze")
    public List<String> getAnalyze(@RequestParam String color) throws Exception {
        return kata.analyze(color);
    }

    @GetMapping("/play")
    public void getPlay(@RequestParam String color, @RequestParam String coord) throws Exception {
        kata.play(color, coord);
    }

}
