class MoveSuggestionList {
    static ENCODE_ANALYZE_MOVE_INDICATOR = -2;

    suggestions = [];
    analyzeMoveSuggestion;
    passSuggestion;
    isPass = false;


    constructor(suggestions, analyzeMoveSuggestion) {
        this.suggestions = suggestions ? suggestions : [];
        this.analyzeMoveSuggestion = analyzeMoveSuggestion;

        if (suggestions && this.suggestions.length != 0 && this.suggestions[0].isPass()) {
            this.isPass = true;
            this.passSuggestion = this.suggestions[0];
        }
    }


    add(suggestion) {
        this.suggestions.push(suggestion);

        if (this.suggestions.length == 1 && this.suggestions[0].isPass()) {
            this.isPass = true;
            this.passSuggestion = this.suggestions[0];
        }
    }

    addGrades() {
        let gradeIndex = 0;
        for (let i = 0; i < this.suggestions.length; i++) {
            let suggestion = this.suggestions[i];
            if (suggestion.isPass()) continue;

            if (i != 0 && suggestion.visits != this.suggestions[i - 1].visits) {
                gradeIndex++;
            }
            suggestion.grade = String.fromCharCode(gradeIndex + 65);
        }
        return this;
    }

    filterByMoveOptions(moveOptions) {
        let moveOptionCount = 1;
        let index;
        for (index = 0; index < this.suggestions.length; index++) {
            if (index != 0 && this.suggestions[index].visits != this.suggestions[index - 1].visits) {
                moveOptionCount++;
                if (moveOptionCount == moveOptions + 1) break;
            }
        }

        this.suggestions = this.suggestions.splice(0, index);
        return this;
    }

    filterByPass() {
        let filteredSuggestions = [];
        this.suggestions.forEach((suggestion) => {
            if (!suggestion.isPass()) filteredSuggestions.push(suggestion);
        });

        let firstSuggestion = this.suggestions[0];
        this.suggestions = filteredSuggestions;

        return firstSuggestion;
    }

    getFilterByWeaker() {
        let move = board.editor.getCurrent().move;
        if (!move) return this.suggestions;

        let playedCoord = new Coord(move.x, move.y);

        if (settings.showWeakerOptions || gameplay.chosenNotPlayedCoordHistory.get() || !this.find(playedCoord)) {
            return this.suggestions;
        }

        let index;
        let playedCoordIndex;
        for (index = 0; index < this.suggestions.length; index++) {
            if (playedCoordIndex == null) {
                if (this.suggestions[index].coord.compare(playedCoord)) {
                    playedCoordIndex = index;
                }
            } else {
                if (this.suggestions[index].visits != this.suggestions[playedCoordIndex].visits) {
                    index--;
                    break;
                }
            }
        }

        return this.suggestions.slice(0, index + 1);
    }

    find(coord) {
        for (let i = 0; i < this.suggestions.length; i++) {
            if (this.suggestions[i].coord.compare(coord)) {
                return this.suggestions[i];
            }
        }
    }

    encode() {
        let encoded = [];

        if (this.analyzeMoveSuggestion) {
            encoded = byteUtils.numToBytes(MoveSuggestionList.ENCODE_ANALYZE_MOVE_INDICATOR, 2, encoded);
            encoded = encoded.concat(this.analyzeMoveSuggestion.encode());
        }

        encoded = byteUtils.numToBytes(this.suggestions.length, 2, encoded);

        for (let i = 0; i < this.suggestions.length; i++) {
            encoded = encoded.concat(this.suggestions[i].encode());
        }

        return encoded;
    }


    get(index) {
        return this.suggestions[index];
    }

    set(index, suggestion) {
        this.suggestions[index] = suggestion;
    }

    length() {
        return this.suggestions.length;
    }


    static fromKataGo(kataGoSuggestions) {
        let nameCoords = [];
        let suggestions = [];
        kataGoSuggestions.forEach((kataGoSuggestion) => {
            nameCoords.push(kataGoSuggestion.move.coord);
            suggestions.push(MoveSuggestion.fromKataGo(kataGoSuggestion));
        });

        console.log(nameCoords);

        return new MoveSuggestionList(suggestions);
    }

    static fromServer(serverSuggestions) {
        let suggestionList = new MoveSuggestionList(null, serverSuggestions.analyzeMoveSuggestion);

        for (let i = 0; i < serverSuggestions.suggestions.length; i++) {
            if (!serverSuggestions.suggestions[i]) continue;

            suggestionList.add(MoveSuggestion.fromServer(serverSuggestions.suggestions[i]));
        }

        suggestionList.addGrades();

        return suggestionList;
    }
}
