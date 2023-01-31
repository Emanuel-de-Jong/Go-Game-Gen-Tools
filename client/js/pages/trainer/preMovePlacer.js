var preMovePlacer = {};


preMovePlacer.SEQUENCES = {
	B: {
		s4_3_n_16_16: [ {x:16,y:4}, {x:4,y:3}, {x:4,y:16}, {x:16,y:16} ],
		s4_3_n_17_16: [ {x:16,y:4}, {x:4,y:3}, {x:4,y:16}, {x:17,y:16} ],
		s4_3_n_16_17: [ {x:16,y:4}, {x:4,y:3}, {x:4,y:16}, {x:16,y:17} ],
		s3_4_n_3_16: [ {x:16,y:4}, {x:3,y:4}, {x:16,y:16}, {x:3,y:16} ],
		s3_4_n_4_16: [ {x:16,y:4}, {x:3,y:4}, {x:16,y:16}, {x:4,y:16} ],
		s3_4_n_4_17: [ {x:16,y:4}, {x:3,y:4}, {x:16,y:16}, {x:4,y:17} ],
		s4_4_n_16_16: [ {x:16,y:4}, {x:4,y:4}, {x:4,y:16}, {x:16,y:16} ],
		// s4_4_n_16_17: [ {x:16,y:4}, {x:4,y:4}, {x:4,y:16}, {x:16,y:17} ],
		s3_16_n_4_3: [ {x:16,y:4}, {x:3,y:16}, {x:16,y:16}, {x:4,y:3} ],
		// s3_16_n_3_4: [ {x:16,y:4}, {x:3,y:16}, {x:16,y:16}, {x:3,y:4} ],
		// s3_16_n_4_4: [ {x:16,y:4}, {x:3,y:16}, {x:16,y:16}, {x:4,y:4} ],
		s4_16_n_4_3: [ {x:16,y:4}, {x:4,y:16}, {x:16,y:16}, {x:4,y:3} ],
		// s4_16_n_3_4: [ {x:16,y:4}, {x:4,y:16}, {x:16,y:16}, {x:3,y:4} ],
		s4_16_n_4_4: [ {x:16,y:4}, {x:4,y:16}, {x:16,y:16}, {x:4,y:4} ],
	},
	W: {
		s16_4_n_16_16: [ {x:16,y:4}, {x:4,y:16}, {x:16,y:16}, {x:4,y:4} ],
		s16_4_n_17_16: [ {x:16,y:4}, {x:4,y:16}, {x:17,y:16}, {x:4,y:4} ],
		s16_4_n_16_17: [ {x:16,y:4}, {x:4,y:16}, {x:16,y:17}, {x:4,y:4} ],
		s17_4_n_3_16: [ {x:17,y:4}, {x:4,y:4}, {x:3,y:16}, {x:16,y:16} ],
		s17_4_n_4_16: [ {x:17,y:4}, {x:4,y:4}, {x:4,y:16}, {x:16,y:16} ],
		s17_4_n_4_17: [ {x:17,y:4}, {x:4,y:4}, {x:4,y:17}, {x:16,y:16} ],
		// s17_4_n_16_16: [ {x:17,y:4}, {x:4,y:4}, {x:16,y:16}, {x:4,y:16} ],
		s17_4_n_17_16: [ {x:17,y:4}, {x:4,y:4}, {x:17,y:16}, {x:4,y:16} ],
		s17_4_n_16_17: [ {x:17,y:4}, {x:4,y:4}, {x:16,y:17}, {x:4,y:17} ],
	}
};

preMovePlacer.MIN_VISITS_PERC = 10;
preMovePlacer.MAX_VISIT_DIFF_PERC = 50;


preMovePlacer.init = function() {
	preMovePlacer.stopButton = document.getElementById("stopPreMoves");
	preMovePlacer.stopButton.addEventListener("click", preMovePlacer.stopButtonClickListener);
	
    preMovePlacer.clear();
};

preMovePlacer.clear = function() {
	preMovePlacer.isStopped = true;
};


preMovePlacer.start = async function () {
	G.setPhase(G.PHASE_TYPE.PREMOVES);

	preMovePlacer.isStopped = false;
	
	preMovePlacer.stopButton.hidden = false;
	selfplay.button.hidden = true;

	let sequences = preMovePlacer.SEQUENCES[G.colorNumToName(G.color)];
	let sequenceKeys = Object.keys(sequences);
	preMovePlacer.sequenceKey = sequenceKeys[utils.randomInt(sequenceKeys.length)];
	let sequence = sequences[preMovePlacer.sequenceKey];

	for (let i=0; i<sequence.length; i++) {
		await board.draw(sequence[i]);
	}

	if (settings.preMovesSwitch) {
		for (let i=sequence.length; i<settings.preMoves; i++) {
			if (preMovePlacer.isStopped) break;

			await preMovePlacer.play();
		}
	}

	await katago.sgf();
	init.clear();
	return;

	while (G.color != board.getNextColor() && !G.isPassed && !sgf.isSGFLoading) {
		await preMovePlacer.play(true);
	}

	preMovePlacer.stopButton.hidden = true;
	selfplay.button.hidden = false;

	if (!G.isPassed && !sgf.isSGFLoading) {
	    gameplay.givePlayerControl();
	}
};

preMovePlacer.stopButtonClickListener = function() {
	preMovePlacer.isStopped = true;
};

preMovePlacer.play = async function(isForced = false) {
	if (!isForced && preMovePlacer.isStopped) return;

	let preOptions = 1;
	if (board.getNextColor() != G.color &&
			(utils.randomInt(100) + 1) <= settings.preOptionPerc) {
		preOptions = settings.preOptions;
	}

	await G.analyze(settings.preVisits, preOptions, preMovePlacer.MIN_VISITS_PERC, preMovePlacer.MAX_VISIT_DIFF_PERC);
	if (G.isPassed) preMovePlacer.isStopped = true;
	if (!isForced && preMovePlacer.isStopped) return;

	await board.play(G.suggestions.get(utils.randomInt(G.suggestions.length())), G.MOVE_TYPE.PRE);
};