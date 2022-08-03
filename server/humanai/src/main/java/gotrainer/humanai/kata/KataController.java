package gotrainer.humanai.kata;

import gotrainer.humanai.Moves;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpUtils;
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
    @ResponseBody
    public void getRestart(HttpServletRequest request, @RequestParam @Min(1) @Max(5000) int maxVisits) throws Exception {
//        System.out.println(request.getHeader("Host"));
        System.out.println("restart");
        kata.restart(maxVisits);
    }

    @GetMapping("/setboardsize")
    public void getSetBoardsize(@RequestParam @Pattern(regexp="(9|13|19)") String boardsize) throws Exception {
        System.out.println("setBoardsize");
        kata.setBoardsize(Integer.parseInt(boardsize));
    }

    @GetMapping("/setrules")
    public void getSetRules(@RequestParam @Pattern(regexp="(japanese|chinese)") String ruleset) throws Exception {
        System.out.println("setRules");
        kata.setRules(ruleset);
    }

    @GetMapping("/setkomi")
    public void getSetKomi(@RequestParam @Min(-150) @Max(150) float komi) throws Exception {
        System.out.println("setKomi");
        kata.setKomi(komi);
    }

    @PostMapping("/setboard")
    public void postSetBoard(@RequestBody @Valid Moves moves) throws Exception {
        System.out.println("setBoard");
        kata.setBoard(moves);
    }

    @PostMapping("/analyze")
    public List<String> postAnalyze(@RequestParam @Pattern(regexp="(B|W)") String color,
                                    @RequestParam @Min(1) @Max(25) int moveOptions,
                                    @RequestParam @Min(0) @Max(5000) int minimumVisits) throws Exception {
//         System.out.println("analyze " + color);
        return kata.analyze(color, moveOptions, minimumVisits);
    }


    @GetMapping("/play")
    public void getPlay(@RequestParam @Pattern(regexp="(B|W)") String color,
                        @RequestParam @Pattern(regexp="([A-H]|[J-T])(1[0-9]|[1-9])") String coord) throws Exception {
//         System.out.println("play " + color + " " + coord);
        kata.play(color, coord);
    }
}
