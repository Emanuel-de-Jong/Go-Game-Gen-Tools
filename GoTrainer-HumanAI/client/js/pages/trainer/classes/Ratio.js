class Ratio {
    moveNumber;
    total;

    right;
    rightStreak;
    rightTopStreak;

    perfect;
    perfectStreak;
    perfectTopStreak;

    constructor(moveNumber, total, right, rightStreak, rightTopStreak, perfect, perfectStreak, perfectTopStreak) {
        this.moveNumber = moveNumber;
        this.total = total;

        this.right = right;
        this.rightStreak = rightStreak;
        this.rightTopStreak = rightTopStreak;

        this.perfect = perfect;
        this.perfectStreak = perfectStreak;
        this.perfectTopStreak = perfectTopStreak;
    }


    getRightPercent() {
        return this.getPercent(this.right);
    }

    getPerfectPercent() {
        return this.getPercent(this.perfect);
    }

    getPercent(count) {
        return Math.round((count / this.total) * 100);
    }
}
