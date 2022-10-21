class MoveSuggestionList {

    suggestions = [];


    constructor(serverSuggestions, suggestions) {
        if (!serverSuggestions) {
            this.suggestions = suggestions;
        } else {
            this.fillWithServerSuggestions(serverSuggestions);
        }
    }

    
    fillWithServerSuggestions(serverSuggestions) {
        let nameCoords = [];
        // let isPassed = false;
        serverSuggestions.forEach(serverSuggestion => {
            // if (isPassed) return;
            // if (serverSuggestion.move.coord == "pass") {
            //     isPassed = true;
            // }

            nameCoords.push(serverSuggestion.move.coord);
            this.suggestions.push(new MoveSuggestion(serverSuggestion));
        });

        // console.log(this.suggestions);
        console.log(nameCoords);
    }

    addGrades() {
        let gradeIndex = 0;
        for (let i=0; i<this.suggestions.length; i++) {
            if (i != 0 && this.suggestions[i].visits != this.suggestions[i - 1].visits) {
                gradeIndex++;
            }
            this.suggestions[i].grade = String.fromCharCode(gradeIndex + 65);
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

    filterWeakerThan(suggestion) {
        let index;
        for (index=0; index<this.suggestions.length; index++) {
            if (this.suggestions[index].coord.compare(suggestion)) {
                break;
            }
        }

        this.suggestions = this.suggestions.splice(0, index);
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