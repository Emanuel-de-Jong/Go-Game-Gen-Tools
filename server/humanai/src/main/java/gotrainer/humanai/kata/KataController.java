package gotrainer.humanai.kata;

import gotrainer.humanai.Moves;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.Pattern;
import java.util.List;

@RestController
@Validated
@RequestMapping("/kata")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class KataController {

    public Kata kata;

    public KataController() throws Exception {
        kata = new Kata();
    }

    @GetMapping("/restart")
    public void getRestart() throws Exception {
        System.out.println("restart");
        kata.restart();
    }

    @GetMapping("/setboardsize")
    public void getSetBoardsize(@RequestParam @Pattern(regexp="(9|13|19)") String boardsize) throws Exception {
        System.out.println("setboardsize");
        kata.setBoardsize(Integer.parseInt(boardsize));
    }

    @GetMapping("/setrules")
    public void getSetRules(@RequestParam @Pattern(regexp="(japanese|chinese)") String ruleset) throws Exception {
        System.out.println("setrules");
        kata.setRules(ruleset);
    }

    @GetMapping("/setkomi")
    public void getSetKomi(@RequestParam @Min(-150) @Max(150) int komi) throws Exception {
        System.out.println("setkomi");
        kata.setKomi(komi);
    }

    @PostMapping("/analyze")
    public List<String> postAnalyze(@RequestBody @Valid Moves moves,
                                    @RequestParam @Pattern(regexp="(B|W)") String color,
                                    @RequestParam @Min(1) @Max(25) int moveOptions,
                                    @RequestParam @Min(25) @Max(1500) int strength) throws Exception {
//        System.out.println("analyze");
        return kata.analyze(moves, color, moveOptions, strength);
    }

}
