class History {
    static ENCODE_Y_INDICATOR = -1;

    grid;
    dataType;


    constructor() {
        this.grid = [];
    }


    add(data, x = board.getNodeX(), y = board.getNodeY()) {
        if (!this.dataType) this.dataType = typeof data;

        if (!this.grid[y]) this.grid[y] = [];
        this.grid[y][x] = data;
    }

    get(x = board.getNodeX(), y = board.getNodeY()) {
        if (!this.grid[y]) return;
        return this.grid[y][x];
    }

    hasY(y) {
        return this.grid[y] != null;
    }

    encode() {
        if (!this.dataType) return [];

        let encoded = [];

        for (const gridPoint of this.iterateGrid()) {
            if (!gridPoint.data) {
                encoded = byteUtils.numToBytes(History.ENCODE_Y_INDICATOR, 2, encoded);
                encoded = byteUtils.numToBytes(gridPoint.y, 2, encoded);
            } else {
                encoded = byteUtils.numToBytes(gridPoint.x, 2, encoded);

                if (this.dataType == "object") {
                    encoded = encoded.concat(gridPoint.data.encode());
                } else {
                    encoded = byteUtils.numToBytes(gridPoint.data, 1, encoded);
                }
            }
        }

        return encoded;
    }


    *iterateData() {
        for (let y = 0; y < this.grid.length; y++) {
            if (!this.grid[y]) continue;
            for (let x = 0; x < this.grid[y].length; x++) {
                if (!this.grid[y][x]) continue;
                yield this.grid[y][x];
            }
        }
    }

    *iterateGrid() {
        for (let y = 0; y < this.grid.length; y++) {
            if (!this.grid[y]) continue;
            yield {
                y: y,
                x: null,
                data: null,
            };

            for (let x = 0; x < this.grid[y].length; x++) {
                if (!this.grid[y][x]) continue;
                yield {
                    y: y,
                    x: x,
                    data: this.grid[y][x],
                };
            }
        }
    }


    static fromServer(serverHistory, dataClass) {
        let history = new History();
        for (let y in serverHistory) {
            for (let x in serverHistory[y]) {
                let data = serverHistory[y][x];
                if (dataClass) {
                    data = dataClass.fromServer(data);
                }

                history.add(data, x, y);
            }
        }

        return history;
    }
}
