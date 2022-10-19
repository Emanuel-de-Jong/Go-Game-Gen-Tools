var scoreChart = {};


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
            yAxisID: 'y1',
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
                for (let i=0; i<chart.data.datasets.length; i++) {
                    if (chart.isDatasetVisible(i) === false) {
                        visibility.push(true);
                    } else {
                        visibility.push(false);
                    }
                }
                return chart.data.datasets.map(
                    (dataset, index) => ({
                        text: dataset.label + (dataset.data.length ? ": " + dataset.data.slice(-1) : ""),
                        fillStyle: dataset.backgroundColor,
                        strokeStyle: dataset.borderColor,
                        hidden: visibility[index]
                    })
                )
            }
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
        afterDataLimits: function(axis) {
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
            color: function(context) {
                if (context.tick.value == 0) return "#000000";
                return "#ffffff";
            },
        },
        afterDataLimits: function(axis) {
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

scoreChart.element = document.getElementById("scoreChart");
scoreChart.chart = new Chart(scoreChart.element, scoreChart.CONFIG);
scoreChart.labels = scoreChart.chart.data.labels;
scoreChart.winrates = scoreChart.chart.data.datasets[0].data;
scoreChart.scores = scoreChart.chart.data.datasets[1].data;


scoreChart.init = async function() {
    
};

scoreChart.clear = async function() {
    scoreChart.labels.length = 0;
    scoreChart.winrates.length = 0;
    scoreChart.scores.length = 0;
    scoreChart.chart.update();
};


scoreChart.canvasClickListener = function(click) {
    const points = scoreChart.chart.getElementsAtEventForMode(click, "nearest", { intersect: false }, true);
    if (points[0]) {
        board.goToNode(scoreChart.labels[points[0].index]);
    }
};
scoreChart.chart.canvas.onclick = scoreChart.canvasClickListener;

scoreChart.settingsColorElementInputListener = function() {
    scoreChart.reverse();
};
settings.scoreChartColorElement.addEventListener("input", scoreChart.settingsColorElementInputListener);

scoreChart.reverse = function() {
    for (let i=0; i<scoreChart.winrates.length; i++) {
        let winrate = scoreChart.winrates[i];
        if (winrate > 50) {
            winrate = 50 - (winrate - 50);
        } else {
            winrate = 50 + (50 - winrate);
        }
        scoreChart.winrates[i] = winrate.toFixed(2);
    }

    for (let i=0; i<scoreChart.scores.length; i++) {
        scoreChart.scores[i] = (scoreChart.scores[i] * -1).toFixed(1);
    }

    scoreChart.chart.update();
};

scoreChart.update = function(suggestion) {
    let moveNumber = board.getMoveNumber();
    if (scoreChart.labels.includes(moveNumber)) return;

    let index;
    for (index=0; index<scoreChart.labels.length; index++) {
        if (scoreChart.labels[index] > moveNumber) {
            break;
        }
    }

    scoreChart.labels.splice(index, 0, moveNumber);

    let winrate = suggestion.winrate;
    winrate = suggestion.color == settings.scoreChartColorElement.value ? winrate : 100 - winrate;
    scoreChart.winrates.splice(index, 0, winrate.toFixed(2));

    let score = suggestion.scoreLead;
    score = suggestion.color == settings.scoreChartColorElement.value ? score : score * -1;
    scoreChart.scores.splice(index, 0, score.toFixed(1));

    scoreChart.chart.update();
};