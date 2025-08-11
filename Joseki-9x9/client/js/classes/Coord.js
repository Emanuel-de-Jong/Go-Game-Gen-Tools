class Coord {

    x;
    y;


    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    
    compare(coord) {
        if (this.x == coord.x && this.y == coord.y) {
            return true;
        }
        return false;
    }

}