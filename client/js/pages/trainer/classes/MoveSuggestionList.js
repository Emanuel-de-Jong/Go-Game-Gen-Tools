class MoveSuggestionList {

    suggestions = [];
    passSuggestion;
    playedCoord;
    chosenCoord;
    isPass = false;


    constructor(serverSuggestions, suggestions) {
        if (!serverSuggestions) {
            this.suggestions = suggestions;
        } else {
            this.fillWithServerSuggestions(serverSuggestions);
        }

        if (this.suggestions.length != 0 && this.suggestions[0].isPass()) {
            this.isPass = true;
            this.passSuggestion = this.suggestions[0];
        }
    }

    
    fillWithServerSuggestions(serverSuggestions) {
        let nameCoords = [];
        serverSuggestions.forEach(serverSuggestion => {
            nameCoords.push(serverSuggestion.move.coord);
            this.suggestions.push(new MoveSuggestion(serverSuggestion));
        });

        console.log(nameCoords);
    }

    addGrades() {
        let gradeIndex = 0;
        for (let i=0; i<this.suggestions.length; i++) {
            let suggestion = this.suggestions[i];
            if (suggestion.isPass()) continue;

            if (i != 0 && suggestion.visits != this.suggestions[i - 1].visits) {
                gradeIndex++;
            }
            suggestion.grade = String.fromCharCode(gradeIndex + 65);
        }
    }

    filterByMoveOptions(moveOptions) {
        let moveOptionCount = 1;
        let index;
        for (index=0; index<this.suggestions.length; index++) {
            if (index != 0 && this.suggestions[index].visits != this.suggestions[index - 1].visits) {
                moveOptionCount++;
                if (moveOptionCount == moveOptions + 1) break;
            }
        }
        
        this.suggestions = this.suggestions.splice(0, index);
    }

    filterByPass() {
        let filteredSuggestions = [];
        this.suggestions.forEach(suggestion => {
            if (!suggestion.isPass()) filteredSuggestions.push(suggestion);
        });

        let firstSuggestion = this.suggestions[0];
        this.suggestions = filteredSuggestions;

        return firstSuggestion;
    }

    getFilterByWeaker() {
        if (settings.showWeakerOptions ||
                (this.chosenCoord && !this.chosenCoord.compare(this.playedCoord) ||
                !this.find(this.playedCoord))) {
            return this.suggestions;
        }
        
        let index;
        for (index=0; index<this.suggestions.length; index++) {
            if (this.suggestions[index].coord.compare(this.playedCoord)) {
                break;
            }
        }

        return this.suggestions.splice(0, index);
    }

    find(coord) {
        for (let i=0; i<this.suggestions.length; i++) {
            if (this.suggestions[i].coord.compare(coord)) {
                return this.suggestions[i];
            }
        }
    }

    encode() {
        let encoded = [];
        encoded = byteUtils.numToBytes(this.suggestions.length, 2, encoded);

        for (let i=0; i<this.suggestions.length; i++) {
            let suggestion = this.suggestions[i];
            encoded = byteUtils.numToBytes(suggestion.visits, 4, encoded);
            encoded = byteUtils.numToBytes(suggestion.grade.charCodeAt(0), 1, encoded);
            encoded = encoded.concat(suggestion.coord.encode());
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

}