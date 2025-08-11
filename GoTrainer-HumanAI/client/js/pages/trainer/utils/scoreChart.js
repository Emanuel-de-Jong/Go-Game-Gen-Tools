var scoreChart = {};


scoreChart.SCORE_Y_INDICATOR = -1;

scoreChart.DATA = {
    datasets: [
        {
            label: "Winrate",
            pointRadius: 1,
            borderColor: "rgb(0, 255, 0)",
            backgroundColor: "rgba(0, 255, 0, 0.3)",
            // fill: {
            //     target: { value: 50 },
            // },
        },
        {
            label: "Score",
            yAxisID: "y1",
            pointRadius: 1,
            borderColor: "rgb(0, 0, 255)",
            backgroundColor: "rgba(0, 0, 255, 0.3)",
            // fill: {
            //     target: { value: 0 },
            // },
        },
    ],
};

scoreChart.PLUGINS = {
    legend: {
        onClick: (event, legendItem, legend) => {
            const datasets = legend.legendItems.map((dataset, index) => {
                return dataset.text;
            });
            const index = datasets.indexOf(legendItem.text);
            if (legend.chart.isDatasetVisible(index) === true) {
                legend.chart.hide(index);
            } else {
                legend.chart.show(index);
            }
        },
        labels: {
            generateLabels: (chart) => {
                let visibility = [];
                for (let i = 0; i < chart.data.datasets.length; i++) {
                    if (chart.isDatasetVisible(i) === false) {
                        visibility.push(true);
                    } else {
                        visibility.push(false);
                    }
                }
                return chart.data.datasets.map((dataset, index) => ({
                    text: dataset.label + (dataset.data.length ? ": " + dataset.data.slice(-1) : ""),
                    fillStyle: dataset.backgroundColor,
                    strokeStyle: dataset.borderColor,
                    hidden: visibility[index],
                }));
            },
        },
    },
};

scoreChart.SCALES = {
    y: {
        suggestedMin: 45,
        suggestedMax: 55,
        title: {
            display: true,
            text: "Winrate",
        },
        afterDataLimits: function (axis) {
            let maxDiff = axis.max - 50;
            let minDiff = 50 - axis.min;
            if (maxDiff > minDiff) {
                axis.min = 50 - maxDiff;
            } else if (minDiff > maxDiff) {
                axis.max = 50 + minDiff;
            }
        },
    },
    y1: {
        position: "right",
        suggestedMin: -2,
        suggestedMax: 2,
        title: {
            display: true,
            text: "Score",
        },
        grid: {
            color: function (context) {
                if (context.tick.value == 0) {
                    return custom.theme == custom.THEME_TYPES.DARK ? "rgb(200, 200, 200)" : "rgb(0, 0, 0)";
                }
                return custom.theme == custom.THEME_TYPES.DARK ? "rgb(33, 37, 41)" : "rgb(255, 255, 255)";
            },
        },
        afterDataLimits: function (axis) {
            if (axis.max > axis.min * -1) {
                axis.min = axis.max * -1;
            } else if (axis.min * -1 > axis.max) {
                axis.max = axis.min * -1;
            }
        },
    },
};

scoreChart.CONFIG = {
    type: "line",
    data: scoreChart.DATA,
    options: {
        responsive: true,
        interaction: {
            intersect: false,
            mode: "index",
        },
        animation: {
            duration: 0,
        },
        plugins: scoreChart.PLUGINS,
        scales: scoreChart.SCALES,
    },
};


scoreChart.init = function () {
    scoreChart.colorElement = document.getElementById("scoreChartColor");

    scoreChart.element = document.getElementById("scoreChart");
    scoreChart.chart = new Chart(scoreChart.element, scoreChart.CONFIG);
    scoreChart.labels = scoreChart.chart.data.labels;
    scoreChart.winrates = scoreChart.chart.data.datasets[0].data;
    scoreChart.scores = scoreChart.chart.data.datasets[1].data;

    scoreChart.chart.canvas.onclick = scoreChart.canvasClickListener;
    scoreChart.colorElement.addEventListener("input", scoreChart.colorElementInputListener);

    custom.themeChangedEvent.add(scoreChart.themeChangedListener);

    scoreChart.clear();
};

scoreChart.clear = function () {
    scoreChart.clearChart();
    scoreChart.history = new History();

    if (G.isLoadingServerData) {
        scoreChart.fillHistoryWithSuggestionHistory();
    }

    if (debug.testData == 1) {
        scoreChart.history.add(new Score(5_0_1_00000, 0), 1, 0);
        scoreChart.history.add(new Score(5_0_2_00000, 0), 2, 0);
        scoreChart.history.add(new Score(5_0_3_00000, 0), 3, 0);
        scoreChart.history.add(new Score(5_0_4_00000, 0), 4, 0);
        scoreChart.history.add(new Score(5_0_5_00000, 0), 5, 0);

        scoreChart.history.add(new Score(5_1_1_00000, 0), 1, 1);
        scoreChart.history.add(new Score(5_1_3_00000, 0), 3, 1);
        scoreChart.history.add(new Score(5_1_4_00000, 0), 4, 1);
        scoreChart.history.add(new Score(5_1_5_00000, 0), 5, 1);

        scoreChart.history.add(new Score(5_2_5_00000, 0), 5, 2);
        scoreChart.history.add(new Score(5_2_6_00000, 0), 6, 2);
    }
};


scoreChart.themeChangedListener = function (e) {
    scoreChart.chart.update();
};

scoreChart.fillHistoryWithSuggestionHistory = function (node = board.editor.getRoot()) {
    for (let i = 0; i < node.children.length; i++) {
        scoreChart.fillHistoryWithSuggestionHistory(node.children[i]);
    }

    if (!node.move) return;

    let suggestionList = G.suggestionsHistory.get(node.navTreeX, node.navTreeY);
    if (!suggestionList) return;

    let suggestion = suggestionList.find(new Coord(node.move.x, node.move.y));
    if (!suggestion) {
        suggestion = suggestionList.analyzeMoveSuggestion;
    }

    scoreChart.history.add(suggestion.score, node.navTreeX, node.navTreeY);
};

scoreChart.clearChart = function () {
    scoreChart.labels.length = 0;
    scoreChart.winrates.length = 0;
    scoreChart.scores.length = 0;
    scoreChart.chart.update();
};

scoreChart.canvasClickListener = function (click) {
    const points = scoreChart.chart.getElementsAtEventForMode(click, "nearest", { intersect: false }, true);
    if (points[0]) {
        board.goToNode(scoreChart.labels[points[0].index]);
    }
};

scoreChart.update = function (suggestion) {
    let moveNumber = board.getMoveNumber();
    if (scoreChart.labels.includes(moveNumber)) return;

    let index;
    for (index = 0; index < scoreChart.labels.length; index++) {
        if (scoreChart.labels[index] > moveNumber) {
            break;
        }
    }

    scoreChart.labels.splice(index, 0, moveNumber);

    let point = suggestion.score.copy();
    if (scoreChart.colorElement.value != G.COLOR_TYPE.B) point.reverse();
    scoreChart.history.add(point, moveNumber);

    let winrate = point.formatWinrate();
    scoreChart.winrates.splice(index, 0, winrate);

    let score = point.formatScoreLead();
    scoreChart.scores.splice(index, 0, score);

    scoreChart.chart.update();
};

scoreChart.refresh = function () {
    let points = [];
    let node = board.editor.getCurrent();
    do {
        let x = node.navTreeX;
        let y = node.navTreeY;

        node = node.parent;

        let point = scoreChart.history.get(x, y);
        if (!point) continue;

        point.index = x;
        points.push(point);
    } while (node);

    points = points.reverse();
    let i;
    for (i = 0; i < points.length; i++) {
        let point = points[i];
        scoreChart.labels[i] = point.index;
        scoreChart.winrates[i] = point.formatWinrate();
        scoreChart.scores[i] = point.formatScoreLead();
    }

    scoreChart.labels.length = i;
    scoreChart.winrates.length = i;
    scoreChart.scores.length = i;

    scoreChart.chart.update();
};

scoreChart.colorElementInputListener = function () {
    scoreChart.reverse();
};

scoreChart.reverse = function () {
    for (let i = 0; i < scoreChart.winrates.length; i++) {
        scoreChart.winrates[i] = (100 - scoreChart.winrates[i]).toFixed(2);
    }

    for (let i = 0; i < scoreChart.scores.length; i++) {
        scoreChart.scores[i] = (scoreChart.scores[i] * -1).toFixed(1);
    }

    scoreChart.chart.update();

    for (const point of scoreChart.history.iterateData()) {
        point.reverse();
    }
};
