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


    constructor(oldRatio, moveNumber, total, right, rightPercent, rightStreak, rightTopStreak,
            perfect, perfectPercent, perfectStreak, perfectTopStreak) {
        if (oldRatio) {
            this.constructFromOld(oldRatio);
            return;
        } else if (!oldRatio && !total) {
            this.constructEmpty();
            return;
        }
        
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

    constructFromOld(oldRatio) {
        this.moveNumber = oldRatio.moveNumber;
        this.total = oldRatio.total;

        this.right = oldRatio.right;
        this.rightPercent = oldRatio.rightPercent;
        this.rightStreak = oldRatio.rightStreak;
        this.rightTopStreak = oldRatio.rightTopStreak;

        this.perfect = oldRatio.perfect;
        this.perfectPercent = oldRatio.perfectPercent;
        this.perfectStreak = oldRatio.perfectStreak;
        this.perfectTopStreak = oldRatio.perfectTopStreak;
    }

    constructEmpty() {
        this.moveNumber = 0;
        this.total = 0;

        this.right = 0;
        this.rightPercent = 0;
        this.rightStreak = 0;
        this.rightTopStreak = 0;

        this.perfect = 0;
        this.perfectPercent = 0;
        this.perfectStreak = 0;
        this.perfectTopStreak = 0;
    }

}