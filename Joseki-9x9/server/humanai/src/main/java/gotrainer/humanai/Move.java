package gotrainer.humanai;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

public class Move {

    @NotBlank
    @Pattern(regexp="(B|W)")
    public String color;

    @NotBlank
    @Pattern(regexp="([A-H]|[J-T])(1[0-9]|[1-9])|pass")
    public String coord;

    public Move() {}

    public Move(String color, String coord) {
        this.color = color;
        this.coord = coord;
    }

}
