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

    encode(byteCount = 1) {
        let encoded = [];
        encoded = byteUtils.numToBytes(this.x, byteCount, encoded);
        encoded = byteUtils.numToBytes(this.y, byteCount, encoded);
        return encoded;
    }


    static fromServer(serverCoord) {
        return new Coord(serverCoord.x, serverCoord.y);
    }
}
