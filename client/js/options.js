var options = {}

options.update = function() {
    options.color = parseInt(document.querySelector("#color").value);
    options.botColor = options.color * -1;
    options.preMoves = parseInt(document.querySelector("#preMoves").value);
    options.moveOptions = parseInt(document.querySelector("#moveOptions").value);
    options.preStrength = parseInt(document.querySelector("#preStrength").value);
    options.strength = parseInt(document.querySelector("#strength").value);
};

options.update();

console.log(options);