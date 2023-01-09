class Ratio {

    moveNumber;
    total;

    right;
    rightPercent;
    rightStreak;
    rightTopStreak;

    perfect;
    perfectPercent;
    perfectStreak;
    perfectTopStreak;


    constructor(moveNumber, total, right, rightPercent, rightStreak, rightTopStreak,
            perfect, perfectPercent, perfectStreak, perfectTopStreak) {
        this.moveNumber = moveNumber;
        this.total = total;

        this.right = right;
        this.rightPercent = rightPercent;
        this.rightStreak = rightStreak;
        this.rightTopStreak = rightTopStreak;

        this.perfect = perfect;
        this.perfectPercent = perfectPercent;
        this.perfectStreak = perfectStreak;
        this.perfectTopStreak = perfectTopStreak;
    }

}