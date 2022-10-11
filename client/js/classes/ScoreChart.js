class ScoreChart {

    DATA = {
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

    PLUGINS = {
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

    SCALES = {
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
                // drawOnChartArea: false,
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

    CONFIG = {
        type: "line",
        data: this.DATA,
        options: {
            responsive: true,
            interaction: {
                intersect: false,
                mode: "index",
            },
            animation: {
                duration: 0,
            },
            plugins: this.PLUGINS,
            scales: this.SCALES,
        },
    };

    chart;
    labels;
    winrates;
    scores;

    constructor(element) {
        this.chart = new Chart(element, this.CONFIG);
        this.labels = this.chart.data.labels;
        this.winrates = this.chart.data.datasets[0].data;
        this.scores = this.chart.data.datasets[1].data;
        
        this.chart.canvas.onclick = (click) => {
            const points = this.chart.getElementsAtEventForMode(click, "nearest", { intersect: false }, true);
            if (points[0]) {
                board.goToNode(this.labels[points[0].index]);
            }
        };

        settings.scoreChartColorElement.addEventListener("input", this.settingsColorElementInputListener);
        document.addEventListener("boardPlayEnd", this.boardPlayEndListener);
    }

    settingsColorElementInputListener() {
        stats.scoreChart.reverse();
    }

    boardPlayEndListener(event) {
        stats.scoreChart.update(event.detail.suggestion);
    }

    reverse() {
        for (let i=0; i<this.winrates.length; i++) {
            let winrate = this.winrates[i];
            if (winrate > 50) {
                winrate = 50 - (winrate - 50);
            } else {
                winrate = 50 + (50 - winrate);
            }
            this.winrates[i] = winrate;
        }

        for (let i=0; i<this.scores.length; i++) {
            this.scores[i] = this.scores[i] * -1;
        }

        this.chart.update();
    }

    update(suggestion) {
        let moveNumber = board.getMoveNumber();
        if (this.labels.includes(moveNumber)) return;

        let index;
        for (index=0; index<this.labels.length; index++) {
            if (this.labels[index] > moveNumber) {
                break;
            }
        }

        this.labels.splice(index, 0, moveNumber);

        let winrate = suggestion.winrate;
        winrate = suggestion.color == settings.scoreChartColorElement.value ? winrate : 100 - winrate;
        this.winrates.splice(index, 0, winrate.toFixed(2));

        let score = suggestion.scoreLead;
        score = suggestion.color == settings.scoreChartColorElement.value ? score : score * -1;
        this.scores.splice(index, 0, score.toFixed(1));

        this.chart.update();
    }

    clear() {
        this.labels.length = 0;
        this.winrates.length = 0;
        this.scores.length = 0;
        this.chart.update();
    }

}